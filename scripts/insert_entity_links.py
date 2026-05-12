import csv
import json
import os
import re
import sys
from dataclasses import dataclass, field

CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "static",
    "data",
    "entity_linking_sample.csv",
)
JSON_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "static",
    "iiif",
    "annotations",
    "entities",
)


@dataclass
class TimeSpan:
    begin_of_the_begin: str = ""
    end_of_the_end: str = ""

    def to_dict(self) -> dict:
        d: dict = {"type": "TimeSpan"}
        if self.begin_of_the_begin:
            d["begin_of_the_begin"] = self.begin_of_the_begin
        if self.end_of_the_end:
            d["end_of_the_end"] = self.end_of_the_end
        return d


@dataclass
class AttributeAssignment:
    timespan: TimeSpan = field(
        default_factory=lambda: TimeSpan(
            begin_of_the_begin="2026-05-11T00:00:00Z",
            end_of_the_end="2026-05-11T23:59:59Z",
        )
    )

    def to_dict(self) -> dict:
        return {
            "type": "AttributeAssignment",
            "carried_out_by": {
                "type": "Group",
                "_label": "Globalise project team",
            },
            "timespan": self.timespan.to_dict(),
        }


# entity --> ZP43i_is_similarity_subject_of
# ascribes_similarity_target is either EntityTarget (non-TimeSpan) or TimeSpan


@dataclass
class EntityTarget:
    id: str
    type: str
    label: str

    def to_dict(self) -> dict:
        return {"id": self.id, "type": self.type, "_label": self.label}


@dataclass
class SimilarityStatus:
    id: str
    label: str
    target: EntityTarget | TimeSpan
    assigned_by: AttributeAssignment = field(default_factory=AttributeAssignment)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": "SimilarityStatus",
            "_label": self.label,
            "ascribes_similarity_target": self.target.to_dict(),
            "ascribes_similarity_relation": "la:equivalent",
            "assigned_by": self.assigned_by.to_dict(),
        }


# ClassificatoryStatus --> ZP12_ascribes_classification
@dataclass
class Classification:
    id: str
    label: str
    assigned_by: AttributeAssignment = field(default_factory=AttributeAssignment)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": "Concept",
            "_label": self.label,
            "assigned_by": self.assigned_by.to_dict(),
        }


# Dimension --> P91_has_unit
@dataclass
class DimensionUnit:
    id: str
    label: str
    assigned_by: AttributeAssignment = field(default_factory=AttributeAssignment)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": "ExchangeUnit",
            "_label": self.label,
            "assigned_by": self.assigned_by.to_dict(),
        }


def _extract_page_id(url):
    """
    Extract the page identifier from an annotation URL.

    Example: NL-HaNA_1.04.02_3598_0797
    """

    m = re.search(r"annotations:entities:(NL-HaNA[^#]+)#", url)
    return m.group(1) if m else None


def _extract_numeric_suffix(url):
    """
    Extract the trailing numeric identifier from a URL or fragment.

    Example: 065193
    """

    m = re.search(r":(\d+)$", url)
    if m:
        return m.group(1)
    m = re.search(r"#(\d+)$", url)
    return m.group(1) if m else None


def _to_utc_day_bounds(begin: str, end: str) -> TimeSpan:
    """
    Convert YYYY-MM-DD CSV values to the day-bound TimeSpan form used in JSON.
    """

    return TimeSpan(
        begin_of_the_begin=f"{begin}T00:00:00Z" if begin else "",
        end_of_the_end=f"{end}T23:59:59Z" if end else "",
    )


def _find_body(data, status_id):
    """
    Return the body dictionary whose id matches the given status id.
    """

    for item in data["items"]:
        for body in item["body"]:
            if body.get("id") == status_id:
                return body
    return None


def _find_entity_subject(body, entity_id):
    """
    Return the inline entity subject object matching the given entity id.
    """

    for key in ("has_classificatory_subject", "has_appellative_subject"):
        subj = body.get(key)
        if isinstance(subj, dict) and subj.get("id") == entity_id:
            return subj
    return None


def _apply_entity_template(entity_obj, row, base_url):
    """
    Add is_similarity_subject_of to the entity subject object.
    """

    entity_id = row["entity_id"].strip()
    entity_type = row["entity_type"].strip() or row["annotation_entity_type"].strip()
    entity_label = row["entity_label"].strip()
    entity_uri = row["entity_uri"].strip() or entity_id

    suffix = _extract_numeric_suffix(entity_id)
    sim_id = f"{base_url}#similarity_status:{suffix}"

    if entity_type == "TimeSpan":
        begin = row["begin_of_the_begin"].strip()
        end = row["end_of_the_end"].strip()
        target: EntityTarget | TimeSpan = _to_utc_day_bounds(begin, end)
    else:
        target = EntityTarget(id=entity_uri, type=entity_type, label=entity_label)

    entity_obj["is_similarity_subject_of"] = SimilarityStatus(
        id=sim_id,
        label=entity_label or entity_type,
        target=target,
    ).to_dict()


def _apply_classification_template(body, row):
    """
    Add ascribes_classification to a ClassificatoryStatus body.
    """

    body["ascribes_classification"] = Classification(
        id=row["concept_uri"].strip(),
        label=row["concept_label"].strip(),
    ).to_dict()


def _apply_dimension_template(entity_obj, row):
    """
    Add unit to a Dimension entity object.
    """

    entity_obj["unit"] = DimensionUnit(
        id=row["concept_uri"].strip(),
        label=row["concept_label"].strip(),
    ).to_dict()


def main():
    """
    Read the CSV and enrich the matching entity annotation JSON files.
    """

    json_cache = {}
    processed = skipped = 0

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            status_id = row["status_id"].strip()
            entity_id = row["entity_id"].strip()
            concept_uri = row["concept_uri"].strip()
            annotation_entity_type = row["annotation_entity_type"].strip()

            if not status_id:
                skipped += 1
                continue

            page_id = _extract_page_id(status_id)
            if not page_id:
                print(
                    f"WARNING: cannot parse page_id from: {status_id}", file=sys.stderr
                )
                skipped += 1
                continue

            if page_id not in json_cache:
                json_path = os.path.join(JSON_DIR, f"{page_id}.json")
                if not os.path.exists(json_path):
                    print(f"WARNING: JSON file not found: {json_path}", file=sys.stderr)
                    skipped += 1
                    continue
                with open(json_path, encoding="utf-8") as jf:
                    json_cache[page_id] = json.load(jf)

            data = json_cache[page_id]
            base_url = data["id"]

            body = _find_body(data, status_id)
            if body is None:
                print(
                    f"WARNING: body not found for status_id={status_id}",
                    file=sys.stderr,
                )
                skipped += 1
                continue

            entity_obj = _find_entity_subject(body, entity_id) if entity_id else None

            entity_uri = row["entity_uri"].strip()
            entity_type = row["entity_type"].strip()
            begin_of_the_begin = row["begin_of_the_begin"].strip()

            # Apply the entity template only when the CSV row provides a target.
            has_entity_target = entity_uri or (
                entity_type == "TimeSpan" and begin_of_the_begin
            )
            if has_entity_target and entity_obj is not None:
                _apply_entity_template(entity_obj, row, base_url)

            # Apply the concept-based template for classifications and dimensions.
            if concept_uri:
                if annotation_entity_type == "Dimension":
                    if entity_obj is not None:
                        _apply_dimension_template(entity_obj, row)
                else:
                    _apply_classification_template(body, row)

            processed += 1

    for page_id, data in json_cache.items():
        json_path = os.path.join(JSON_DIR, f"{page_id}.json")
        with open(json_path, "w", encoding="utf-8") as jf:
            json.dump(data, jf, indent=2, ensure_ascii=False)

    print(f"Done. Processed {processed} rows, skipped {skipped}.")


if __name__ == "__main__":
    main()

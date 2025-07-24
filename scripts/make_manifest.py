import json
import pandas as pd
import iiif_prezi3

iiif_prezi3.config.configs["helpers.auto_fields.AutoLang"].auto_lang = "en"
iiif_prezi3.load_bundled_extensions()

PREFIX = "https://globalise-huygens.github.io/document-view-sandbox/iiif/"


def make_manifest(df):

    manifest = iiif_prezi3.Manifest(
        id=f"{PREFIX}manifest.json",
        label="Demo Manifest for the GLOBALISE Document View Sandbox",
    )

    for i in df.itertuples():

        index = i.index

        iiif_info_url = i.iiif_info_url
        filename = i.filename
        canvas_id = i.canvas_id
        url = i.archive_url

        manifest.make_canvas_from_iiif(
            url=iiif_info_url,
            id=canvas_id,
            anno_page_id=f"{PREFIX}manifest.json/{index}/p1/page",
            anno_id=f"{PREFIX}manifest.json/{index}/p1/page/anno",
            label=filename,
            metadata=[
                iiif_prezi3.KeyValueString(
                    label="Filename",
                    value={"none": [filename]},
                ),
                iiif_prezi3.KeyValueString(
                    label="Web",
                    value={"none": [f'<a href="{url}">{url}</a>']},
                ),
            ],
        )

    return manifest


def main(selection_filepath="selection.csv", output_filepath="manifest.json"):

    df = pd.read_csv(selection_filepath)

    manifest = make_manifest(df)

    manifest_jsonld = manifest.jsonld_dict()
    with open(output_filepath, "w") as outfile:
        json.dump(manifest_jsonld, outfile, indent=2)


if __name__ == "__main__":

    main(
        selection_filepath="data/selection.csv",
        output_filepath="static/iiif/manifest.json",
    )

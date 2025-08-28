import json
import pandas as pd
import iiif_prezi3

iiif_prezi3.config.configs["helpers.auto_fields.AutoLang"].auto_lang = "en"

PREFIX = "https://globalise-huygens.github.io/document-view-sandbox/iiif/"


def make_manifest(df, navdate):
    manifest = iiif_prezi3.Manifest(
        id=f"{PREFIX}manifest.json",
        label="Demo Manifest for the GLOBALISE Document View Sandbox",
        navDate=navdate,
        navPlace=iiif_prezi3.NavPlace(
            features=[
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Makassar",
                    },
                    "geometry": {"type": "Point", "coordinates": [119.4055, -5.1339]},
                }
            ]
        ),
        rights="http://creativecommons.org/publicdomain/zero/1.0/",
        requiredStatement=iiif_prezi3.KeyValueString(
            label="Attribution",
            value='<span>GLOBALISE Project. <a href="https://creativecommons.org/publicdomain/zero/1.0/"> <img src="https://licensebuttons.net/l/zero/1.0/88x31.png" alt="CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"/> </a> </span>',
        ),
    )

    globalise_logo = (
        "https://globalise-huygens.github.io/document-view-sandbox/globalise.png"
    )

    logo = iiif_prezi3.ResourceItem(
        id=globalise_logo,
        type="Image",
        format="image/png",
        height=182,
        width=1200,
    )

    provider = iiif_prezi3.ProviderItem(
        id="https://globalise.huygens.knaw.nl",
        label="GLOBALISE Project",
        homepage=[
            iiif_prezi3.HomepageItem(
                id="https://globalise.huygens.knaw.nl",
                type="Text",
                format="text/html",
                label="GLOBALISE Project",
            )
        ],
        logo=[logo],
    )
    manifest.provider = [provider]

    manifest.create_thumbnail_from_iiif(
        "https://service.archief.nl/iipsrv?IIIF=/8e/8c/4d/8e/c4/05/4e/ff/a3/39/6b/55/ba/55/bc/95/75fbe126-7735-410e-ba4f-4f4a7a9a06e7.jp2"
    )

    ## Document metadata
    manifest.metadata = [
        iiif_prezi3.KeyValueString(
            label="Title",
            value={
                "none": [
                    "Notitie van alle soo van als na Batavia alhier ten handel komende vaertuijgen te weeten t zedert primo October Anno passato tot ultimo deses namentlijk etc."
                ]
            },
        ),
        # Description
        iiif_prezi3.KeyValueString(
            label="Description",
            value={
                "en": [
                    "This is a list of which sea faring vessels called at or left Batavia, who their captains or owners were, who the passengers on the ship were and which commodities were carried aboard the ship."
                ]
            },
        ),
        iiif_prezi3.KeyValueString(
            label="Date",
            value={"none": ["1781-09-30"]},
        ),
        iiif_prezi3.KeyValueString(
            label="Type",
            value={"none": ["Letter"]},
        ),
        iiif_prezi3.KeyValueString(
            label="Inventory number",
            value={"none": ["3598"]},
        ),
        iiif_prezi3.KeyValueString(
            label="TANAP-id",
            value={"none": ["96500"]},
        ),
        iiif_prezi3.KeyValueString(
            label="Description (TANAP)",
            value={
                "nl": [
                    "Twee afschriften van in 1781 door gouverneur Barend Reijke en raad tot Makasser aan de hoge regering tot Batavia verzonden brieven."
                ]
            },
        ),
        iiif_prezi3.KeyValueString(
            label="Type (TANAP)",
            value={
                "nl": [
                    "Correspondentie met de Gouverneur-Generaal of de Hoge Regering met bijlagen of registers der marginalen"
                ]
            },
        ),
        iiif_prezi3.KeyValueString(
            label="Identifier",
            value={"none": ["8548bbb9-11d4-4530-8098-12354f2dbdc2"]},
        ),
    ]

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

    manifest = make_manifest(df, navdate="1781-09-30T00:00:00Z")

    with open(output_filepath, "w", encoding="utf-8") as f:
        s = manifest.json(indent=2)

        js = json.loads(s)

        js["@context"] = [
            "http://iiif.io/api/extension/navplace/context.json",
            "http://iiif.io/api/presentation/3/context.json",
        ]

        json.dump(js, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main(
        selection_filepath="static/data/selection.csv",
        output_filepath="static/iiif/manifest.json",
    )

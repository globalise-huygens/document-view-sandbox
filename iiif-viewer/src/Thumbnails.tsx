import type { Manifest } from "@iiif/presentation-3";
import React from "react";

type ThumbnailsProps = {
  manifest: Manifest;
  thumbnailClickHandler: (index: number) => void;
};

type Thumbnail = {
  label: string;
  serviceId: string;
  index: number;
};

type Thumbnails = Thumbnail[];

function Thumbnails(props: ThumbnailsProps) {
  const [activeThumb, setActiveThumb] = React.useState<number>(0);
  const thumbs = props.manifest.items.reduce<Thumbnails>((acc, item, index) => {
    const label = item.label?.en?.[0] ?? "Missing label";
    if (!item.items) return acc;

    item.items.forEach((annoPage) => {
      if (!annoPage.items) return;

      annoPage.items.forEach((anno) => {
        if (!anno.body?.service) return;

        const serviceIds = anno.body.service
          .map((service) => service["@id"])
          .filter((id): id is string => id != null);

        const result = {
          label: label,
          serviceId: serviceIds,
          index: index,
        };

        acc.push(result);
      });
    });

    return acc;
  }, []);

  const thumbParams = "/full/,150/0/default.jpg";

  return (
    <div className="thumbnails">
      {thumbs.map((thumb, index) => (
        <div
          className={`thumbnail ${activeThumb === index ? "active" : null}`}
          key={index}
          onClick={() => {
            setActiveThumb(thumb.index);
            props.thumbnailClickHandler(thumb.index);
          }}
        >
          <img
            src={thumb.serviceId + thumbParams}
            alt={thumb.label}
            title={thumb.label}
          ></img>
          <div className="thumbnail-label">{thumb.label}</div>
        </div>
      ))}
    </div>
  );
}

export default Thumbnails;

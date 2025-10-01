import type { Manifest } from "@iiif/presentation-3";
import React from "react";

type TranscriptionProps = {
  manifest: Manifest;
  text: string[] | undefined;
};

function Transcription(props: TranscriptionProps) {
  return (
    <div className="transcription-pane">
      <div className="transcription-header">
        <h3>Transcription</h3>
      </div>
      <div className="transcription-content">
        {props.text?.map((line, index) => (
          <React.Fragment key={index}>
            <span>{line}</span>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Transcription;

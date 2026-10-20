import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { Breve } from "./Breve";
import { FPS, totalFrames } from "./script";
import { totalBreve } from "./breve";

export const Root: React.FC = () => (
  <>
    <Composition id="PrimariaSecondaria" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={totalFrames()} />
    <Composition id="Breve" component={Breve} width={1080} height={1920} fps={FPS} durationInFrames={totalBreve()} />
  </>
);

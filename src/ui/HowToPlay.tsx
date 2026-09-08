export default function HowToPlay() {
  return (
    <ol className="how-to-play">
      <li>
        <strong>Wind the clock.</strong> Press <em>Initiate Winding</em>, then press again when the marker lands in
        the bright zone. The gold sliver in the middle is a Great Success.
      </li>
      <li>
        <strong>Watch your Heat.</strong> Winding heats up the mechanism — too much and it jams.
        <span className="touch-only"> Hold the Rewind button</span>
        <span className="pointer-only">
          {' '}
          Hold <kbd>Space</kbd> or <kbd>right-click</kbd>
        </span>{' '}
        to cool down. It costs Energy, but buys you time too.
      </li>
      <li>
        <strong>Grab loose gears</strong> near the clock face for bonus Components.
      </li>
      <li>
        <strong>Spend Components</strong> in the Workshop below for upgrades.
      </li>
      <li>
        <strong>Don't let it strike midnight.</strong> When it does, your score becomes Temporal Cores — permanent
        upgrades for your next run.
      </li>
    </ol>
  );
}

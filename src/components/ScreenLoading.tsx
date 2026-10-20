import {Center} from '@astryxdesign/core/Center';
import {Spinner} from '@astryxdesign/core/Spinner';

/** Tela de loading da área de conteúdo, enquanto a tela seguinte monta. */
export default function ScreenLoading() {
  return (
    <Center axis="both" className="fury-screen-loading">
      <Spinner size="md" shade="default" aria-label="Loading" />
    </Center>
  );
}

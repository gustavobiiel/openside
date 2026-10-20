'use client';

import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Timer} from '@astryxdesign/core/Timer';
import type {TimerProps} from '@astryxdesign/core/Timer';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Hora atual no mesmo estilo do Timer: o formato `clock` contado a partir da
 * meia-noite local é a hora do dia. Na virada do dia o início é recalculado.
 */
export function LiveClock(props: Omit<TimerProps, 'startTime' | 'format'>) {
  const [midnight, setMidnight] = useState(startOfToday);

  useEffect(() => {
    const id = window.setTimeout(
      () => setMidnight(startOfToday()),
      midnight + 86_400_000 - Date.now() + 50,
    );
    return () => window.clearTimeout(id);
  }, [midnight]);

  return <Timer format="clock" startTime={midnight} {...props} />;
}

interface TimerFormatsProps {
  startTime: number;
  elapsedLabel?: string;
  clockLabel?: string;
}

export function TimerFormats({
  startTime,
  elapsedLabel = 'Decorrido',
  clockLabel = 'Relógio',
}: TimerFormatsProps) {
  return (
    <Stack direction="vertical" gap={3}>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <Text type="supporting" color="secondary">
          {elapsedLabel}
        </Text>
        <Timer startTime={startTime} type="body" color="primary" />
      </Stack>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <Text type="supporting" color="secondary">
          {clockLabel}
        </Text>
        <Timer
          format="clock"
          startTime={startTime}
          type="body"
          color="primary"
        />
      </Stack>
    </Stack>
  );
}

interface TimerReadoutProps {
  label: string;
  children: ReactNode;
}

export function TimerReadout({label, children}: TimerReadoutProps) {
  return (
    <Stack direction="horizontal" gap={2} vAlign="center">
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

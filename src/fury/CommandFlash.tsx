'use client';

import {Kbd} from '@astryxdesign/core/Kbd';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {HStack, VStack, Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {SHELL_COMMANDS, type ShellCommand, type ShellCommandId} from './shellCommands';

/** Confirmação curta no topo: a combinação e a tela em que o sistema entrou. */
export default function CommandFlash({command}: {command: ShellCommand}) {
  return (
    <div className="fury-command-flash" role="status" aria-live="polite">
      <Card padding={3}>
        <HStack gap={3} vAlign="center">
          <Kbd keys={command.keys} />
          <Text type="body" weight="bold">
            {command.enters ? `Entrei em ${command.label}` : command.label}
          </Text>
        </HStack>
      </Card>
    </div>
  );
}

/** Lista que o Ctrl+Shift+/ abre depois do tour. */
export function ShortcutSheet({
  open,
  onOpenChange,
  onRun,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onRun: (id: ShellCommandId) => void;
}) {
  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      purpose="info"
      width={440}
      aria-label="Atalhos">
      <Layout
        header={<DialogHeader title="Atalhos" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={4}>
              <Text type="body" color="secondary">
                Ctrl+Shift e uma letra entram na tela. Ctrl+K acorda a busca.
                As outras telas você chama pelo nome, no campo do topo.
              </Text>
              <VStack gap={2}>
                {SHELL_COMMANDS.map(command => (
                  <div key={command.id} className="fury-shortcut-row">
                    <HStack gap={2} vAlign="center">
                      <Kbd keys={command.keys} />
                      <Text type="body">{command.label}</Text>
                    </HStack>
                    {command.enters ? (
                      <Button
                        label="Entrar"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onRun(command.id);
                        }}
                      />
                    ) : command.id === 'search' ? (
                      <Button
                        label="Focar"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onRun(command.id);
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </VStack>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

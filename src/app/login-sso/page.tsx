// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ShieldCheckIcon} from '@heroicons/react/24/outline';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Section} from '@astryxdesign/core/Section';
import {Link} from '@astryxdesign/core/Link';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const MANIFESTO_VIDEO =
  'https://cdn-sites-assets.mziq.com/wp-content/uploads/sites/339/2021/06/MANIFESTO32W.mp4';

type SSOProvider = {
  name: string;
  abbr: string;
  logo?: string;
};
const SSO_PROVIDERS: Record<string, SSOProvider> = {
  'google.com': {
    name: 'Google Workspace',
    abbr: 'G',
    logo: '/google-workspace.svg',
  },
  'microsoft.com': {
    name: 'Microsoft Entra ID',
    abbr: 'M',
    logo: '/microsoft.svg',
  },
  'okta.com': {name: 'Okta', abbr: 'O'},
  'meta.com': {name: 'Meta SSO', abbr: 'M'},
  'apple.com': {name: 'Apple Business', abbr: 'A'},
};
const DEFAULT_SSO_PROVIDER: SSOProvider = {
  name: 'SSO',
  abbr: 'S',
  logo: '/microsoft.svg',
};

function getProvider(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? (SSO_PROVIDERS[domain] ?? null) : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = 'email' | 'sso-confirm' | 'password-fallback';

export default function LoginSSO({onSuccess}: {onSuccess?: () => void}) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const provider = getProvider(email) ?? DEFAULT_SSO_PROVIDER;
  const emailValid = email.trim() !== '';

  const handleSSO = () => {
    if (!emailValid) {
      return;
    }
    setStep('sso-confirm');
  };

  const handleBack = () => {
    setStep('email');
    setLoginFailed(false);
    setIsLoading(false);
  };

  const handleSignIn = () => {
    if (!password) {
      setLoginFailed(true);
      return;
    }
    setIsLoading(true);
    setLoginFailed(false);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
    }, 2000);
  };

  const completeSignIn = () => {
    if (!emailValid) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
    }, 1500);
  };

  return (
    <div className="fury-sso">
      <div className="fury-sso-panel">
      <Card padding={8} width="100%" maxWidth={400}>
        <VStack gap={4} hAlign="stretch">
          {/* ── Step 1: Email entry ── */}
          {step === 'email' && (
            <>
              <VStack gap={1} hAlign="center">
                <img
                  src="/americanas-wordmark.webp"
                  alt="Americanas"
                  style={{
                    width: '100%',
                    maxWidth: 270,
                    height: 'auto',
                    display: 'block',
                  }}
                />
                <Text type="body" color="secondary" size="sm">
                  Informe seus dados para entrar na sua conta
                </Text>
              </VStack>

              <VStack gap={2}>
                <TextInput
                  label="E-mail corporativo"
                  isLabelHidden
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={setEmail}
                  size="lg"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      completeSignIn();
                    }
                  }}
                />
                <TextInput
                  label="Senha"
                  isLabelHidden
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={setPassword}
                  size="lg"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      completeSignIn();
                    }
                  }}
                />
              </VStack>

              <Link href="#" size="sm" color="secondary" type="supporting">
                Problemas para entrar?
              </Link>

              <Button
                label="Entrar"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onClick={completeSignIn}
                isDisabled={!emailValid}
              />

              <Divider label="Ou entre com" />

              <Button
                label="Continuar com SSO"
                variant="secondary"
                size="lg"
                onClick={handleSSO}
                isDisabled={!emailValid}
              />

              <VStack hAlign="center">
                <Text type="supporting" color="secondary">
                  Não tem uma conta?{' '}
                  <Link href="#" type="supporting">
                    Solicitar acesso
                  </Link>
                </Text>
              </VStack>
            </>
          )}

          {/* ── Step 2a: SSO provider detected ── */}
          {step === 'sso-confirm' && (
            <>
              <VStack gap={2} hAlign="center">
                {provider.logo ? (
                  <span className="fury-sso-provider-logo">
                    <img src={provider.logo} alt="" />
                  </span>
                ) : (
                  <Avatar name={provider.name} size={48} />
                )}
                <Text type="display-3" as="h2">
                  Entrar com {provider.name}
                </Text>
                <Text type="body" color="secondary" size="sm">
                  Você volta para cá depois de entrar.
                </Text>
              </VStack>

              <Card padding={0}>
                <Section variant="muted" padding={4}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={ShieldCheckIcon} color="secondary" />
                    <VStack gap={0}>
                      <Text type="label">{provider.name}</Text>
                      <Text type="supporting" color="secondary">
                        {email}
                      </Text>
                    </VStack>
                  </HStack>
                </Section>
              </Card>

              <VStack gap={3}>
                <Button
                  label={`Continuar com ${provider.name}`}
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  onClick={completeSignIn}
                />
                <Button
                  label="Usar outro e-mail"
                  variant="ghost"
                  size="lg"
                  onClick={handleBack}
                />
              </VStack>
            </>
          )}

          {/* ── Step 2b: No SSO — password fallback ── */}
          {step === 'password-fallback' && (
            <>
              <VStack gap={1} hAlign="center">
                <Text type="display-1" as="h2">
                  Bem-vindo de volta
                </Text>
                <Text type="body" color="secondary" size="sm">
                  {email}
                </Text>
              </VStack>

              <VStack gap={4}>
                <VStack gap={1}>
                  <TextInput
                    label="Senha"
                    type="password"
                    value={password}
                    size="lg"
                    onChange={(v: string) => {
                      setPassword(v);
                      setLoginFailed(false);
                    }}
                    status={
                      loginFailed
                        ? {
                            type: 'error',
                            message: 'Senha incorreta. Tente de novo.',
                          }
                        : undefined
                    }
                  />
                  {loginFailed && (
                    <VStack hAlign="end">
                      <Link
                        href="#"
                        size="sm"
                        color="secondary"
                        type="supporting">
                        Esqueceu a senha?
                      </Link>
                    </VStack>
                  )}
                </VStack>

                <Button
                  label="Entrar"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  onClick={handleSignIn}
                />
                <Button
                  label="Usar outro e-mail"
                  variant="ghost"
                  size="lg"
                  onClick={handleBack}
                />
              </VStack>
            </>
          )}
        </VStack>
      </Card>
      </div>
      <div className="fury-sso-stage" aria-hidden="true">
        <video
          className="fury-sso-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={MANIFESTO_VIDEO} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

import type { Dictionary } from "@delivery/i18n";

import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";

import { Login } from "@/app/_components/login-form";

import { DomainNameForm } from "../_components/domain-name-form";
import { GithubAppForm } from "../_components/github-app-form";
import { OnboardingDictionaryProvider } from "../_components/onboarding-dictionary";
import { SkipOnboardingForm } from "../_components/skip-onboarding";
import { StepProvider } from "../_components/step";
import { onBoardingTest } from "./fixtures";
import { setup } from "./utils";

const AUTH_DICTIONARY = {
  signinTitle: "Welcome back",
  signupTitle: "Welcome",
  signinDescription: "Sign in to your Delivery account.",
  signupDescription: "Create your Delivery account.",
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  repeatPasswordLabel: "Repeat password",
  repeatPasswordPlaceholder: "Repeat your password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  showRepeatPassword: "Show repeat password",
  hideRepeatPassword: "Hide repeat password",
  noAccount: "Don't have an account?",
  registerHere: "Register here.",
  alreadyAccount: "Already have an account?",
  signInHere: "Sign in here.",
  loading: "Loading...",
  signIn: "Sign in",
  signUp: "Sign up",
  invalidCredentials: "Invalid email or password. Please try again.",
  signUpFailed: "Unable to create your account.",
} as const;

const FRENCH_AUTH_DICTIONARY = {
  ...AUTH_DICTIONARY,
  emailLabel: "E-mail",
  emailPlaceholder: "Saisissez votre e-mail",
  passwordLabel: "Mot de passe",
  passwordPlaceholder: "Saisissez votre mot de passe",
  repeatPasswordLabel: "Confirmer le mot de passe",
  repeatPasswordPlaceholder: "Confirmez votre mot de passe",
  noAccount: "Vous n'avez pas de compte ?",
  registerHere: "Inscrivez-vous.",
  alreadyAccount: "Vous avez déjà un compte ?",
  signInHere: "Connectez-vous.",
  loading: "Chargement...",
  signIn: "Se connecter",
  signUp: "S'inscrire",
} as const;

const FRENCH_ONBOARDING_DICTIONARY = {
  loading: "Chargement…",
  stepStatusLoading: "Vérification de l’étape…",
  steps: [
    { title: "Création du compte", description: "Pour gérer vos applications." },
    { title: "URL", description: "Pour exposer vos applications sur Internet." },
    { title: "Application GitHub", description: "Pour créer des déploiements." },
    { title: "Déployer votre application", description: "Pour déployer votre application." },
  ],
  domain: {
    label: "Nom de domaine",
    placeholder: "ex. http://mondomaine.com",
    help: "Le nom de domaine public de votre serveur.",
    next: "Suivant",
    submitLabel: "Envoyer le nom de domaine",
  },
  github: {
    nameLabel: "Nom de l’application GitHub",
    namePlaceholder: "MonSuperGitHubApp",
    nameHelp: "Saisissez un nom pour votre application GitHub.",
    eventsLabel: "Redéployer lorsque",
    eventsHelp: "Quels événements doivent déclencher un redéploiement ?",
    organizationLabel: "Nom de l’organisation",
    organizationPlaceholder: "Facebook",
    organizationHelp: "Saisissez le nom de votre organisation GitHub.",
    organizationAccount: "Compte d’organisation ?",
    organizationTooltip: "Vos dépôts sont-ils dans un compte d’organisation GitHub ?",
    createAndInstall: "Créer et installer l’application GitHub",
    manifestLabel: "Manifeste de l’application GitHub",
    events: { push: "du code est envoyé sur une branche" },
  },
  skip: { action: "Passer", loading: "Chargement…", formLabel: "Passer l’onboarding" },
} as unknown as Dictionary["onboarding"];

function OnboardingProvider({ children }: React.PropsWithChildren) {
  return (
    <OnboardingDictionaryProvider locale="fr" onboarding={FRENCH_ONBOARDING_DICTIONARY}>
      {children}
    </OnboardingDictionaryProvider>
  );
}

describe("onboarding process", () => {
  beforeAll(() => {
    vi.mock("@/app/actions", () => {
      const signUp = vi.fn();
      signUp.mockResolvedValue({ error: "Impossible to sign up", inputs: { email: "", password: "" } });
      const domainName = vi.fn();
      const skipOnboardingDeployment = vi.fn();
      return { domainName, signUp, skipOnboardingDeployment };
    });

    vi.mock("@/app/(login)/actions", () => {
      const signIn = vi.fn();
      signIn.mockResolvedValue({ error: "Impossible to sign in", inputs: { email: "", password: "" } });
      return { signIn };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  onBoardingTest(
    "should display error message related to registering",
    async ({ users }) => {
      const { userAction } = setup(<Login auth={AUTH_DICTIONARY} isOnboarding={true} locale="en" />);
      const registeredUser = users.find(user => user.registered);
      const form = within(screen.getByRole("form"));

      await userAction.type(form.getByRole("textbox", { name: "email" }), registeredUser!.email);
      await userAction.type(form.getByLabelText("password"), registeredUser!.password);
      await userAction.type(form.getByLabelText("Repeat password"), registeredUser!.password);
      await userAction.click(form.getByRole("button"));

      await waitFor(() => {
        expect(form.getByText("Impossible to sign up")).toBeDefined();
      });
    },
  );

  onBoardingTest("renders the authentication form in French", () => {
    setup(<Login auth={FRENCH_AUTH_DICTIONARY} locale="fr" />);

    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Mot de passe")).toBeDefined();
    expect(screen.getByText("S'inscrire")).toBeDefined();
    expect(screen.getByText("Vous avez déjà un compte ?")).toBeDefined();
  });

  onBoardingTest("github form include initial object to create a github app from manifest", () => {
    setup(<GithubAppForm isOnboarding={true} />);

    const form = within(screen.getByRole("form"));

    expect(screen.getByLabelText("Github App name")).toBeDefined();

    const manifestInput = form.getByLabelText<HTMLInputElement>("manifest");
    expect(manifestInput.value).toBeDefined();

    const initialGithubAppManifest = JSON.parse(manifestInput.value);
    expect(initialGithubAppManifest).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        url: expect.any(String),
        hook_attributes: expect.objectContaining({
          url: expect.any(String),
          active: expect.any(Boolean),
        }),
        redirect_url: expect.any(String),
        callback_urls: expect.any(Array),
        setup_url: expect.any(String),
        request_oauth_on_install: expect.any(Boolean),
        default_permissions: expect.objectContaining({
          contents: expect.any(String),
          metadata: expect.any(String),
          emails: expect.any(String),
          administration: expect.any(String),
          pull_requests: expect.any(String),
        }),
        default_events: expect.any(Array),
      }),
    );
  });

  onBoardingTest("renders onboarding forms in French", () => {
    setup(
      <OnboardingProvider>
        <DomainNameForm />
        <GithubAppForm isOnboarding={true} />
        <SkipOnboardingForm />
        <StepProvider><div /></StepProvider>
      </OnboardingProvider>,
    );

    expect(screen.getByLabelText("Nom de domaine")).toBeDefined();
    expect(screen.getByPlaceholderText("ex. http://mondomaine.com")).toBeDefined();
    expect(screen.getByText("Créer et installer l’application GitHub")).toBeDefined();
    expect(screen.getByText("du code est envoyé sur une branche")).toBeDefined();
    expect(screen.getByRole("form", { name: "Passer l’onboarding" })).toBeDefined();
    expect(screen.getByText("Création du compte")).toBeDefined();
  });

  /* onBoardingTest(
    "submit input should be disabled when no repository is selected",
    ({ installations }) => {
      setup(<DeploymentForm installations={installations} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", true);
    },
  );

  onBoardingTest(
    "submit input should be enabled when repository is selected",
    async ({ installations }) => {
      const { userAction } = setup(<Deployment installations={installations} isOnboarding={true} />);
      const form = within(screen.getByRole("form"));
      const repoCard = screen.getByTestId("1-repo-card");
      await userAction.click(repoCard);
      expect(form.getByLabelText("submit")).toHaveProperty("disabled", false);
    },
  ); */
});

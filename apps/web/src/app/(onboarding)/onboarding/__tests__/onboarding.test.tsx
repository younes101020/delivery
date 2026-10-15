import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, vi } from "vitest";

import { Login } from "@/app/_components/login-form";

import { GithubAppForm } from "../_components/github-app-form";
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

describe("onboarding process", () => {
  beforeAll(() => {
    vi.mock("@/app/actions", () => {
      const signUp = vi.fn();
      signUp.mockResolvedValue({ error: "Impossible to sign up", inputs: { email: "", password: "" } });
      return { signUp };
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

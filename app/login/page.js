import LoginForm from "../_components/LoginForm"; // Import the new form

export const metadata = {
  title: "Login",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-10 mt-10 items-center">
      <h2 className="text-3xl font-semibold">
        Sign in to access your guest area
      </h2>

      <LoginForm /> 
      {/* Replace SignInButton with LoginForm */}
      {/* You might want to add a link to the signup page here as well */}
      {/* <p className="text-center text-sm">
        Don't have an account?{' '}
        <a href="/signup" className="text-accent-500 hover:underline">
          Sign up
        </a>
      </p> */}
      {/* The LoginForm already includes a sign up link, so this might be redundant */}
    </div>
  );
}

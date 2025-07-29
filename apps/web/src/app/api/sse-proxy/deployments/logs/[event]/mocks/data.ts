export const deploymentData = [
  {
    jobName: "clone",
    jobId: "job_123abc",
    logs: "Cloning repository from git@github.com:user/repo.git...\nClone completed successfully\n",
    isCriticalError: false,
  },
  {
    jobName: "build",
    jobId: "job_456def",
    logs: "Installing dependencies...\nRunning npm install\nBuild started...\nBuild completed\n",
    isCriticalError: false,
  },
  {
    jobName: "configure",
    jobId: "job_789ghi",
    logs: "Configuring environment variables...\nSetting up database connections\nConfiguration complete\n",
    isCriticalError: true,
  },
  {
    jobName: "build",
    jobId: "job_012jkl",
    logs: "Error: Build failed\nUnable to resolve dependencies\n",
    isCriticalError: false,
  },
  {
    jobName: "build",
    jobId: "job_013mno",
    logs: "Retrying build...\nInstalling dependencies\nBuild process restarted\n",
    isCriticalError: false,
  },
  {
    jobName: "build",
    jobId: "job_014pqr",
    logs: "Build successful\nGenerating artifacts\nBuild artifacts created\n",
    isCriticalError: false,
  },
  {
    jobName: "build",
    jobId: "job_015stu",
    logs: "Running tests...\nAll tests passed\nBuild verification complete",
    isCriticalError: false,
  },
  {
    completed: true,
    appId: 12345,
  },
];

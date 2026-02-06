async function main(): Promise<void> {

  const port = parseInt(process.env.PORT || '3000', 10);
  const serverUrl = process.env.PUBLIC_URL?.trim() || `http://localhost:${port}`;
  console.log(`Server listening on ${serverUrl}`);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

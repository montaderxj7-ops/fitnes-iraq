fetch('https://fitnes-iraq.vercel.app/api/test-env')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

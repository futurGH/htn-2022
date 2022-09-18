export function NotAuthed() {
  return (
    <div className="flex w-screen h-screen justify-center items-center">
      <button type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=cj2bo41rsxpgmoancduwqg1enoptuz&redirect_uri=${encodeURI("http://localhost:3000/auth/twitch")}&response_type=code&scope=chat:read+chat:edit`
              }}
      >Authenticate with Twitch</button>
    </div>
  )
}

import { useState, useEffect } from 'react'
import axios from 'axios'
import { NotAuthed } from "@/routes/NotAuthed";
import { Dashboard } from "@/routes/Dashboard";

export function App() {
   const [authed, setAuthed] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/auth/is-authed")
      .then((response) => setAuthed(response.status === 200))
      .catch((error) => console.log(error));
  }, []);

  return authed ? <Dashboard /> : <NotAuthed />
}

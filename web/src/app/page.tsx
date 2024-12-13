import { auth } from "~/auth"

export default async function Page() {
  const a = await auth()

  console.log(a)

  return <div>
    asd
  </div>
}
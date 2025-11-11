import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <div>
      <Link href={'/upload'}>upload</Link>
      <Link href={'/request'}>request</Link>
    </div>
  )
}

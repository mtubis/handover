function encode(value: string): string {
  // RFC 6068: line breaks in a mailto: body must be encoded as CRLF.
  return encodeURIComponent(value.replace(/\r?\n/g, '\r\n'))
}

export function buildMailto(to: string, subject: string, body: string): string {
  const recipients = to
    .split(/[,;\s]+/)
    .filter((address) => address !== '')
    .map((address) => encodeURIComponent(address).replace(/%40/g, '@'))
    .join(',')
  return `mailto:${recipients}?subject=${encode(subject)}&body=${encode(body)}`
}

import { StyledLink } from 'baseui/link'
import isEmpty from 'lodash/isEmpty'
import { isFileField } from '../../hooks/useQuery'
import type { DataType, TObject } from '../../types'
import type { IClientProps } from './Base'
import Code, { formatJSON } from './Base'

function formatValue(value: unknown, schema?: DataType, indent = 4) {
  if (value === null || value === undefined)
    return 'None'

  if (schema && isFileField(schema)) {
    if (schema.type === 'array') {
      if (isEmpty(value))
        return '[]'

      return `[\n${(value as File[]).map(
        item => `${' '.repeat(indent + 4)}open("${item.name}", "rb")`,
      ).join(',\n')},\n${' '.repeat(indent)}]`
    }
    else {
      return `open("${(value as File).name}", "rb")`
    }
  }
  else {
    return formatJSON(value, indent)
      .replace(/\bnull\b/g, 'None')
      .replace(/\btrue\b/g, 'True')
      .replace(/\bfalse\b/g, 'False')
  }
}

function formatQuery(data: object, schema: TObject, indent = 4) {
  if (isEmpty(data))
    return ''

  return `\n${' '.repeat(indent + 4)}${Object.entries(data)
    .map(([key, value]) => `${key}=${formatValue(value, schema.properties?.[key], indent + 4)}`)
    .join(`,\n${' '.repeat(indent + 4)}`)},\n${' '.repeat(indent)}`
}

function generateCode(data: object, path = '/', schema?: TObject) {
  return `from bentoml_io.client import SyncHTTPClient

with SyncHTTPClient("http://localhost:3000") as client:
    result = client.${path.slice(1)}(${formatQuery(data, schema!, 4)})
`
}

function Python({ path, values, schema }: IClientProps) {
  return (
    <div>
      <p>
        First, install
        <StyledLink href="https://bentoml.com/">BentoML</StyledLink>
        :
      </p>
      <Code language="bash">$ pip install bentoml</Code>
      <p>Then, paste the following code into your script or REPL:</p>
      <Code language="python">{generateCode(values, path, schema)}</Code>
    </div>
  )
}

export default Python
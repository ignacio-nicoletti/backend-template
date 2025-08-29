import { config } from '../../core/server/config'

// Validar la clave al importar
function validateEncryptionKey(): string {
  const key = config.encryptionKey

  if (!key) {
    throw new Error('ENCRYPTION_KEY no está configurada en las variables de entorno')
  }

  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)

  if (keyData.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY debe tener exactamente 32 bytes. Actual: ${keyData.length} bytes`
    )
  }

  return key
}

const ENCRYPTION_KEY = validateEncryptionKey()

// Función para derivar una clave
async function deriveKey(keyString: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(keyString)

  return await crypto.subtle.importKey('raw', keyData, { name: 'AES-CBC' }, false, [
    'encrypt',
    'decrypt',
  ])
}

// Función de encriptación
export async function encrypt(text: string | null | undefined): Promise<string | null> {
  try {
    if (!text || text.toString().trim() === '') {
      return null
    }

    const key = await deriveKey(ENCRYPTION_KEY)
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const encoder = new TextEncoder()
    const data = encoder.encode(text.toString())

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, key, data)

    // Combinar IV + datos encriptados en base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Error en encriptación:', error)
    throw new Error(`Error al encriptar: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Función de desencriptación
export async function decrypt(encryptedText: string): Promise<string> {
  try {
    if (!encryptedText) throw new Error('Texto encriptado no puede estar vacío')

    const key = await deriveKey(ENCRYPTION_KEY)
    const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0))

    // Validar longitud mínima
    if (combined.length < 32) {
      throw new Error('Texto encriptado inválido')
    }

    // Extraer IV y datos encriptados
    const iv = combined.slice(0, 16)
    const encrypted = combined.slice(16)

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, encrypted)

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Error en desencriptación:', error)
    throw new Error(
      `Error al desencriptar: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Función para verificar si un texto está encriptado
export function isEncrypted(text: string): boolean {
  try {
    if (!text || typeof text !== 'string') return false

    // Verificar que sea base64 válido
    const decoded = atob(text)
    const array = Uint8Array.from(decoded, (c) => c.charCodeAt(0))

    // Debe tener al menos IV (16 bytes) + algún dato
    return array.length >= 32
  } catch {
    return false
  }
}

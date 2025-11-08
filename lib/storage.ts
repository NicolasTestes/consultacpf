export interface CPFData {
  cpf: string
  nome: string
  mae: string
  dataNascimento: string
  endereco: string
  email: string
  telefone: string
  renda: number
}

export function saveCPFData(data: CPFData): void {
  const cpfs = getAllCPFs()
  const index = cpfs.findIndex((c) => c.cpf === data.cpf)

  if (index >= 0) {
    cpfs[index] = data
  } else {
    cpfs.push(data)
  }

  localStorage.setItem("cpf_data", JSON.stringify(cpfs))
}

export function getAllCPFs(): CPFData[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("cpf_data")
  return data ? JSON.parse(data) : []
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "")

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== Number.parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== Number.parseInt(cpf.charAt(10))) return false

  return true
}

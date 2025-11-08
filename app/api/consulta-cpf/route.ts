import { type NextRequest, NextResponse } from "next/server"

const API_TOKEN = "TPLZxEIhaoLpoAXILmLQxEVR"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get("cpf")

    if (!cpf) {
      return NextResponse.json({ error: "CPF não informado" }, { status: 400 })
    }

    const apiUrl = `https://completa.workbuscas.com/api?token=${API_TOKEN}&modulo=cpf&consulta=${cpf.replace(/\D/g, "")}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao consultar API" }, { status: response.status })
    }

    const data = await response.json()

    const nome = data.DadosBasicos?.nome || "Não disponível"
    const mae = data.DadosBasicos?.nomeMae || "Não disponível"
    const dataNascimento = data.DadosBasicos?.dataNascimento || "Não disponível"

    const enderecos =
      data.enderecos
        ?.filter((end: any) => end.logradouro)
        .map((end: any) =>
          `${end.tipoLogradouro || ""} ${end.logradouro || ""}, ${end.logradouroNumero || ""} ${end.complemento ? "- " + end.complemento : ""} - ${end.bairro || ""}, ${end.cidade || ""} - ${end.uf || ""} CEP: ${end.cep || ""}`.trim(),
        ) || []

    const primeiroEmail = data.emails?.[0]
    const email = primeiroEmail?.email || "Não disponível"

    const telefones = data.telefones?.filter((tel: any) => tel.telefone).map((tel: any) => tel.telefone) || []

    const renda = data.DadosEconomicos?.renda || "0"
    const score = data.DadosEconomicos?.score?.scoreCSB || "Não disponível"

    return NextResponse.json({
      cpf: cpf.replace(/\D/g, ""),
      nome,
      mae,
      dataNascimento,
      enderecos: enderecos.length > 0 ? enderecos : ["Não disponível"],
      email,
      telefones: telefones.length > 0 ? telefones : ["Não disponível"],
      renda,
      score,
    })
  } catch (error) {
    console.error("[v0] Erro na API de consulta:", error)
    return NextResponse.json({ error: "Erro ao processar consulta" }, { status: 500 })
  }
}

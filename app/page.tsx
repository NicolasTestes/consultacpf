"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface CPFResult {
  cpf: string
  nome: string
  mae: string
  dataNascimento: string
  enderecos: string[]
  email: string
  telefones: string[]
  renda: string
  score: string
  classificacao: string
  error?: string
}

export default function Home() {
  const [cpfList, setCpfList] = useState("")
  const [results, setResults] = useState<CPFResult[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleConsulta = async () => {
    const cpfs = cpfList
      .split("\n")
      .map((cpf) => cpf.trim().replace(/\D/g, ""))
      .filter((cpf) => cpf.length === 11)

    if (cpfs.length === 0) {
      alert("Por favor, insira pelo menos um CPF válido")
      return
    }

    setLoading(true)
    setResults([])
    setProgress({ current: 0, total: cpfs.length })

    const resultados: CPFResult[] = []

    for (let i = 0; i < cpfs.length; i++) {
      const cpf = cpfs[i]
      setProgress({ current: i + 1, total: cpfs.length })

      try {
        const response = await fetch(`/api/consulta-cpf?cpf=${cpf}`)
        const data = await response.json()

        if (data.error) {
          resultados.push({
            cpf,
            nome: "Erro na consulta",
            mae: "-",
            dataNascimento: "-",
            enderecos: ["-"],
            email: "-",
            telefones: ["-"],
            renda: "-",
            score: "-",
            classificacao: "ERRO",
            error: data.error,
          })
        } else {
          const renda = Number.parseFloat(data.renda?.replace(",", ".") || "0")
          const classificacao = renda >= 3000 ? "BOA" : "RUIM"

          resultados.push({
            cpf: data.cpf,
            nome: data.nome,
            mae: data.mae,
            dataNascimento: data.dataNascimento,
            enderecos: data.enderecos,
            email: data.email,
            telefones: data.telefones,
            renda: data.renda,
            score: data.score,
            classificacao,
          })
        }
      } catch (error) {
        resultados.push({
          cpf,
          nome: "Erro na requisição",
          mae: "-",
          dataNascimento: "-",
          enderecos: ["-"],
          email: "-",
          telefones: ["-"],
          renda: "-",
          score: "-",
          classificacao: "ERRO",
          error: String(error),
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setResults(resultados)
    setLoading(false)
  }

  const exportToTxt = () => {
    let content = "═══════════════════════════════════════════════════════\n"
    content += "          RELATÓRIO DE CONSULTA DE CPF\n"
    content += "═══════════════════════════════════════════════════════\n\n"

    results.forEach((result, index) => {
      content += `${index + 1} CPF\n`
      content += `───────────────────────────────────────────────────────\n`
      content += `CPF: ${result.cpf}\n`
      content += `NOME: ${result.nome}\n`
      content += `MÃE: ${result.mae}\n`
      content += `DATA NASCIMENTO: ${result.dataNascimento}\n`
      content += `ENDEREÇO(S):\n`
      result.enderecos.forEach((end) => {
        content += `  ${end}\n`
      })
      content += `EMAIL: ${result.email}\n`
      content += `TELEFONE(S):\n`
      result.telefones.forEach((tel) => {
        content += `  ${tel}\n`
      })
      content += `RENDA: R$ ${result.renda}\n`
      content += `SCORE: ${result.score}\n`
      content += `CLASSIFICAÇÃO: ${result.classificacao}\n`
      content += `───────────────────────────────────────────────────────\n\n`
    })

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `consulta-cpf-${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    let content = ""
    results.forEach((result, index) => {
      content += `${index + 1} CPF\n`
      content += `CPF: ${result.cpf}\n`
      content += `NOME: ${result.nome}\n`
      content += `MÃE: ${result.mae}\n`
      content += `DATA NASCIMENTO: ${result.dataNascimento}\n`
      content += `ENDEREÇO(S):\n`
      result.enderecos.forEach((end) => {
        content += `  ${end}\n`
      })
      content += `EMAIL: ${result.email}\n`
      content += `TELEFONE(S):\n`
      result.telefones.forEach((tel) => {
        content += `  ${tel}\n`
      })
      content += `RENDA: R$ ${result.renda}\n`
      content += `SCORE: ${result.score}\n`
      content += `CLASSIFICAÇÃO: ${result.classificacao}\n\n`
    })
    navigator.clipboard.writeText(content)
    alert("Resultados copiados para área de transferência!")
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Consulta de CPF
          </h1>
          <p className="text-amber-200/80">Cole os CPFs abaixo, um por linha</p>
        </div>

        <Card className="bg-zinc-950 border-amber-600/30 mb-6 shadow-lg shadow-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-500">Lista de CPFs</CardTitle>
            <CardDescription className="text-amber-200/60">
              Cole os CPFs um por linha. Exemplo: 12345678910
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="12345678910&#10;98765432100&#10;11122233344"
              value={cpfList}
              onChange={(e) => setCpfList(e.target.value)}
              className="min-h-[200px] bg-black border-amber-700/50 text-amber-100 font-mono focus:border-amber-500 focus:ring-amber-500/50"
            />
            <Button
              onClick={handleConsulta}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 text-black font-bold shadow-lg shadow-amber-900/50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando {progress.current}/{progress.total}...
                </>
              ) : (
                "Consultar Todos"
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="bg-zinc-950 border-amber-600/30 shadow-lg shadow-amber-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-500">Resultados ({results.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="bg-black border-amber-700/50 text-amber-300 hover:bg-amber-900/20 hover:text-amber-200"
                  >
                    Copiar
                  </Button>
                  <Button
                    onClick={exportToTxt}
                    variant="outline"
                    size="sm"
                    className="bg-black border-amber-700/50 text-amber-300 hover:bg-amber-900/20 hover:text-amber-200"
                  >
                    Baixar .TXT
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-black rounded-lg border border-amber-700/30 shadow-md shadow-amber-900/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-amber-400">{index + 1} CPF</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.classificacao === "BOA"
                            ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/50"
                            : result.classificacao === "ERRO"
                              ? "bg-orange-900/30 text-orange-400 border border-orange-700/50"
                              : "bg-red-900/30 text-red-400 border border-red-700/50"
                        }`}
                      >
                        {result.classificacao}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-amber-600/80">CPF:</span>{" "}
                        <span className="text-amber-100">{result.cpf}</span>
                      </div>
                      <div>
                        <span className="text-amber-600/80">NOME:</span>{" "}
                        <span className="text-amber-100">{result.nome}</span>
                      </div>
                      <div>
                        <span className="text-amber-600/80">MÃE:</span>{" "}
                        <span className="text-amber-100">{result.mae}</span>
                      </div>
                      <div>
                        <span className="text-amber-600/80">DATA NASCIMENTO:</span>{" "}
                        <span className="text-amber-100">{result.dataNascimento}</span>
                      </div>
                      <div>
                        <div className="text-amber-600/80 mb-1">ENDEREÇO(S):</div>
                        <div className="pl-4 space-y-1">
                          {result.enderecos.map((end, i) => (
                            <div key={i} className="text-amber-100">
                              • {end}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-amber-600/80">EMAIL:</span>{" "}
                        <span className="text-amber-100">{result.email}</span>
                      </div>
                      <div>
                        <div className="text-amber-600/80 mb-1">TELEFONE(S):</div>
                        <div className="pl-4 space-y-1">
                          {result.telefones.map((tel, i) => (
                            <div key={i} className="text-amber-100">
                              • {tel}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-amber-600/80">RENDA:</span>{" "}
                        <span className="text-amber-100">R$ {result.renda}</span>
                      </div>
                      <div>
                        <span className="text-amber-600/80">SCORE:</span>{" "}
                        <span className="text-amber-100">{result.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

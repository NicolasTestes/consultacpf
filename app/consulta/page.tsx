"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Download, Copy, Loader2 } from "lucide-react"
import Link from "next/link"
import { getAllCPFs, type CPFData } from "@/lib/storage"

interface ConsultaResult extends CPFData {
  classificacao: "BOA" | "RUIM"
  score?: number
}

export default function ConsultaPage() {
  const [cpfs, setCpfs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ConsultaResult[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    const allCPFs = getAllCPFs()
    setCpfs(allCPFs.map((c) => c.cpf))
  }, [])

  const consultarTodos = async () => {
    if (cpfs.length === 0) {
      setMessage("Nenhum CPF cadastrado para consultar")
      return
    }

    setLoading(true)
    setMessage("")
    setResults([])

    try {
      const response = await fetch("/api/consulta-cpf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpfs }),
      })

      if (!response.ok) {
        throw new Error("Erro ao consultar CPFs")
      }

      const data = await response.json()
      setResults(data.results)
      setMessage(`${data.results.length} CPF(s) consultado(s) com sucesso!`)
    } catch (error) {
      setMessage("Erro ao consultar CPFs. Verifique o token da API.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const exportarTXT = () => {
    let texto = "RESULTADO DA CONSULTA DE CPFs\n"
    texto += "=".repeat(50) + "\n\n"

    results.forEach((result, index) => {
      texto += `${index + 1} CPF\n`
      texto += `CPF: ${result.cpf}\n`
      texto += `NOME: ${result.nome}\n`
      texto += `NOME DA MÃE: ${result.mae}\n`
      texto += `DATA DE NASCIMENTO: ${result.dataNascimento}\n`
      texto += `ENDEREÇO: ${result.endereco}\n`
      texto += `EMAIL: ${result.email}\n`
      texto += `TELEFONE: ${result.telefone}\n`
      texto += `RENDA: R$ ${result.renda.toFixed(2)}\n`
      if (result.score) {
        texto += `SCORE: ${result.score}\n`
      }
      texto += `CLASSIFICAÇÃO: ${result.classificacao}\n`
      texto += "-".repeat(50) + "\n\n"
    })

    const blob = new Blob([texto], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consulta-cpfs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
  }

  const copiarTexto = () => {
    let texto = ""
    results.forEach((result, index) => {
      texto += `${index + 1} CPF\n`
      texto += `CPF: ${result.cpf}\n`
      texto += `NOME: ${result.nome}\n`
      texto += `NOME DA MÃE: ${result.mae}\n`
      texto += `DATA DE NASCIMENTO: ${result.dataNascimento}\n`
      texto += `ENDEREÇO: ${result.endereco}\n`
      texto += `EMAIL: ${result.email}\n`
      texto += `TELEFONE: ${result.telefone}\n`
      texto += `RENDA: R$ ${result.renda.toFixed(2)}\n`
      if (result.score) {
        texto += `SCORE: ${result.score}\n`
      }
      texto += `CLASSIFICAÇÃO: ${result.classificacao}\n\n`
    })

    navigator.clipboard.writeText(texto)
    setMessage("Texto copiado para a área de transferência!")
    setTimeout(() => setMessage(""), 2000)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-red-500 hover:text-red-400 hover:bg-red-950/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <Card className="max-w-4xl mx-auto bg-zinc-900 border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-500">Consultar CPFs</CardTitle>
            <CardDescription className="text-gray-400">CPFs cadastrados disponíveis para consulta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">CPFs Cadastrados ({cpfs.length})</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {cpfs.map((cpf, index) => (
                  <Badge key={index} variant="outline" className="bg-red-950/20 text-red-400 border-red-800">
                    {cpf}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={consultarTodos}
                disabled={loading || cpfs.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Consultar Todos os CPFs
                  </>
                )}
              </Button>
            </div>

            {message && (
              <div
                className={`p-3 rounded ${message.includes("sucesso") || message.includes("copiado") ? "bg-green-900/20 text-green-400 border border-green-800" : "bg-red-900/20 text-red-400 border border-red-800"}`}
              >
                {message}
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={exportarTXT}
                    variant="outline"
                    className="flex-1 border-red-800 text-red-400 hover:bg-red-950/20 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar TXT
                  </Button>
                  <Button
                    onClick={copiarTexto}
                    variant="outline"
                    className="flex-1 border-red-800 text-red-400 hover:bg-red-950/20 bg-transparent"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Texto
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300">Resultados</h3>
                  {results.map((result, index) => (
                    <Card key={index} className="bg-black border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between text-red-400">
                          <span>
                            {index + 1} CPF - {result.cpf}
                          </span>
                          <Badge
                            className={
                              result.classificacao === "BOA"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-700 hover:bg-red-800"
                            }
                          >
                            {result.classificacao}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-gray-300">
                        <p>
                          <strong className="text-red-400">NOME:</strong> {result.nome}
                        </p>
                        <p>
                          <strong className="text-red-400">NOME DA MÃE:</strong> {result.mae}
                        </p>
                        <p>
                          <strong className="text-red-400">DATA DE NASCIMENTO:</strong> {result.dataNascimento}
                        </p>
                        <p>
                          <strong className="text-red-400">ENDEREÇO:</strong> {result.endereco}
                        </p>
                        <p>
                          <strong className="text-red-400">EMAIL:</strong> {result.email}
                        </p>
                        <p>
                          <strong className="text-red-400">TELEFONE:</strong> {result.telefone}
                        </p>
                        <p>
                          <strong className="text-red-400">RENDA:</strong> R$ {result.renda.toFixed(2)}
                        </p>
                        {result.score && (
                          <p>
                            <strong className="text-red-400">SCORE:</strong> {result.score}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

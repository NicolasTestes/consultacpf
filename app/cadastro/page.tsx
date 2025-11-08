"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { saveCPFData, validateCPF } from "@/lib/storage"

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    mae: "",
    dataNascimento: "",
    endereco: "",
    email: "",
    telefone: "",
    renda: "",
  })
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCPF(formData.cpf)) {
      setMessage("CPF inválido")
      return
    }

    const renda = Number.parseFloat(formData.renda.replace(/\D/g, "")) / 100

    saveCPFData({
      cpf: formData.cpf,
      nome: formData.nome,
      mae: formData.mae,
      dataNascimento: formData.dataNascimento,
      endereco: formData.endereco,
      email: formData.email,
      telefone: formData.telefone,
      renda: renda,
    })

    setMessage("CPF cadastrado com sucesso!")
    setFormData({
      cpf: "",
      nome: "",
      mae: "",
      dataNascimento: "",
      endereco: "",
      email: "",
      telefone: "",
      renda: "",
    })

    setTimeout(() => setMessage(""), 3000)
  }

  const handleRendaChange = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const formatted = (Number.parseInt(numbers || "0") / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    setFormData({ ...formData, renda: formatted })
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

        <Card className="max-w-2xl mx-auto bg-zinc-900 border-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-500">Cadastrar CPF</CardTitle>
            <CardDescription className="text-gray-400">
              Preencha todos os campos para cadastrar um novo CPF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cpf" className="text-gray-300">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="nome" className="text-gray-300">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="João da Silva"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="mae" className="text-gray-300">
                  Nome da Mãe
                </Label>
                <Input
                  id="mae"
                  value={formData.mae}
                  onChange={(e) => setFormData({ ...formData, mae: e.target.value })}
                  placeholder="Maria da Silva"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="dataNascimento" className="text-gray-300">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="endereco" className="text-gray-300">
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="telefone" className="text-gray-300">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div>
                <Label htmlFor="renda" className="text-gray-300">
                  Renda Mensal
                </Label>
                <Input
                  id="renda"
                  value={formData.renda}
                  onChange={(e) => handleRendaChange(e.target.value)}
                  placeholder="R$ 0,00"
                  required
                  className="bg-black border-red-900/50 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded ${message.includes("sucesso") ? "bg-green-900/20 text-green-400 border border-green-800" : "bg-red-900/20 text-red-400 border border-red-800"}`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Cadastrar CPF
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

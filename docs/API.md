# API Documentation

## 📡 Base URL

```
Development: http://localhost:5000/api/v1
Production: https://seu-dominio.com/api/v1
```

## 🔐 Autenticação

Todas as rotas (exceto login/registro) requerem autenticação via JWT Bearer Token.

**Header**:
```
Authorization: Bearer <seu_token_jwt>
```

## 📋 Formato de Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-12-12T00:00:00Z"
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": []
  },
  "timestamp": "2024-12-12T00:00:00Z"
}
```

## 🗂️ Endpoints

### 1. Autenticação

#### POST /auth/register
Registrar novo usuário.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "João Silva",
  "role": "manager"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "João Silva",
      "role": "manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login
Fazer login.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "João Silva",
      "role": "manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/refresh
Renovar token de acesso.

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/logout
Fazer logout (invalida tokens).

**Response** (200):
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### 2. Clientes

#### GET /clients
Listar todos os clientes com paginação.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (buscar por nome, CPF/CNPJ)
- `active` (true/false)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": 1,
        "name": "Maria Santos",
        "cpf_cnpj": "123.456.789-00",
        "phone": "(11) 98765-4321",
        "whatsapp": "5511987654321",
        "email": "maria@example.com",
        "client_type": "individual",
        "is_active": true,
        "total_orders": 5,
        "last_order_date": "2024-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

#### GET /clients/:id
Obter detalhes de um cliente específico.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maria Santos",
    "cpf_cnpj": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "whatsapp": "5511987654321",
    "email": "maria@example.com",
    "client_type": "individual",
    "notes": "Cliente VIP",
    "is_active": true,
    "addresses": [
      {
        "id": 1,
        "label": "Casa",
        "street": "Rua das Flores",
        "number": "123",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-567",
        "latitude": -23.550520,
        "longitude": -46.633309,
        "is_default": true
      }
    ],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### POST /clients
Criar novo cliente.

**Request**:
```json
{
  "name": "Maria Santos",
  "cpf_cnpj": "123.456.789-00",
  "phone": "(11) 98765-4321",
  "whatsapp": "5511987654321",
  "email": "maria@example.com",
  "client_type": "individual",
  "notes": "Cliente indicado",
  "address": {
    "label": "Casa",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "latitude": -23.550520,
    "longitude": -46.633309
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maria Santos",
    "...": "..."
  },
  "message": "Cliente criado com sucesso"
}
```

#### PUT /clients/:id
Atualizar cliente.

**Request**: Mesmo formato do POST (campos opcionais)

**Response** (200):
```json
{
  "success": true,
  "data": { ... },
  "message": "Cliente atualizado com sucesso"
}
```

#### DELETE /clients/:id
Desativar cliente (soft delete).

**Response** (200):
```json
{
  "success": true,
  "message": "Cliente desativado com sucesso"
}
```

#### GET /clients/:id/history
Histórico de serviços do cliente.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_orders": 5,
    "total_spent": 2500.00,
    "orders": [
      {
        "id": 10,
        "order_number": "OS-2024-0010",
        "service_type": "refrigeration",
        "status": "completed",
        "created_at": "2024-12-01T10:00:00Z",
        "completed_at": "2024-12-01T15:30:00Z",
        "final_cost": 350.00
      }
    ]
  }
}
```

---

### 3. Ordens de Serviço

#### GET /orders
Listar ordens de serviço com filtros.

**Query Parameters**:
- `page`, `limit`
- `status` (open, assigned, in_progress, waiting_part, completed, cancelled)
- `service_type` (refrigeration, electrical)
- `technician_id`
- `client_id`
- `start_date`, `end_date`
- `search` (buscar por número, equipamento, problema)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 10,
        "order_number": "OS-2024-0010",
        "client": {
          "id": 1,
          "name": "Maria Santos",
          "whatsapp": "5511987654321"
        },
        "technician": {
          "id": 2,
          "name": "João Técnico"
        },
        "service_type": "refrigeration",
        "equipment": "Ar condicionado Split 12000 BTUs",
        "status": "in_progress",
        "priority": "high",
        "scheduled_date": "2024-12-12T14:00:00Z",
        "estimated_cost": 300.00,
        "created_at": "2024-12-10T09:00:00Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "total": 150,
      "open": 10,
      "in_progress": 8,
      "completed": 130,
      "cancelled": 2
    }
  }
}
```

#### GET /orders/:id
Obter detalhes completos de uma OS.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 10,
    "order_number": "OS-2024-0010",
    "client": {
      "id": 1,
      "name": "Maria Santos",
      "phone": "(11) 98765-4321",
      "whatsapp": "5511987654321"
    },
    "technician": {
      "id": 2,
      "name": "João Técnico",
      "phone": "(11) 91234-5678"
    },
    "address": {
      "street": "Rua das Flores, 123",
      "city": "São Paulo",
      "state": "SP",
      "latitude": -23.550520,
      "longitude": -46.633309
    },
    "service_type": "refrigeration",
    "equipment": "Ar condicionado Split 12000 BTUs",
    "problem": "Não está gelando",
    "diagnosis": "Falta de gás refrigerante",
    "solution": "Carga de gás realizada",
    "status": "completed",
    "priority": "normal",
    "scheduled_date": "2024-12-12T14:00:00Z",
    "started_at": "2024-12-12T14:15:00Z",
    "completed_at": "2024-12-12T16:30:00Z",
    "estimated_cost": 300.00,
    "final_cost": 350.00,
    "photos": [
      {
        "id": 1,
        "filename": "antes.jpg",
        "url": "/uploads/orders/10/antes.jpg",
        "photo_type": "before",
        "uploaded_at": "2024-12-12T14:20:00Z"
      }
    ],
    "notes": "Cliente solicitou manutenção preventiva adicional",
    "created_at": "2024-12-10T09:00:00Z",
    "updated_at": "2024-12-12T16:30:00Z"
  }
}
```

#### POST /orders
Criar nova ordem de serviço.

**Request** (multipart/form-data):
```json
{
  "client_id": 1,
  "address_id": 1,
  "service_type": "refrigeration",
  "equipment": "Ar condicionado Split 12000 BTUs",
  "problem": "Não está gelando",
  "priority": "normal",
  "scheduled_date": "2024-12-15T14:00:00Z",
  "estimated_cost": 300.00,
  "notes": "Cliente preferencialmente pela manhã"
}
```
+ arquivos de fotos (campo: `photos[]`)

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 11,
    "order_number": "OS-2024-0011",
    "...": "..."
  },
  "message": "OS criada com sucesso. Confirmação enviada via WhatsApp."
}
```

#### PUT /orders/:id
Atualizar OS.

**Request**: Campos opcionais

**Response** (200):
```json
{
  "success": true,
  "data": { ... },
  "message": "OS atualizada com sucesso"
}
```

#### PATCH /orders/:id/status
Atualizar apenas o status da OS.

**Request**:
```json
{
  "status": "in_progress",
  "notes": "Técnico chegou no local"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Status atualizado. Notificação enviada ao cliente."
}
```

#### PATCH /orders/:id/assign
Atribuir técnico à OS.

**Request**:
```json
{
  "technician_id": 2
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Técnico atribuído com sucesso"
}
```

#### POST /orders/:id/photos
Adicionar fotos à OS.

**Request** (multipart/form-data):
- `photo_type`: before/during/after
- `photos[]`: arquivos

**Response** (201):
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": 5,
        "filename": "foto1.jpg",
        "url": "/uploads/orders/10/foto1.jpg"
      }
    ]
  }
}
```

#### DELETE /orders/:id
Cancelar OS.

**Request**:
```json
{
  "cancellation_reason": "Cliente desistiu do serviço"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "OS cancelada com sucesso"
}
```

---

### 4. Orçamentos

#### GET /quotes
Listar orçamentos.

**Query Parameters**:
- `page`, `limit`
- `status` (pending, sent, approved, rejected, expired)
- `client_id`
- `start_date`, `end_date`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "quotes": [
      {
        "id": 5,
        "quote_number": "ORC-2024-0005",
        "client": {
          "id": 1,
          "name": "Maria Santos"
        },
        "order": {
          "id": 10,
          "order_number": "OS-2024-0010"
        },
        "total": 450.00,
        "status": "pending",
        "valid_until": "2024-12-20",
        "created_at": "2024-12-10T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET /quotes/:id
Detalhes do orçamento.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 5,
    "quote_number": "ORC-2024-0005",
    "client": { ... },
    "order": { ... },
    "description": "Manutenção preventiva + carga de gás",
    "items": [
      {
        "description": "Mão de obra - Manutenção preventiva",
        "quantity": 1,
        "unit_price": 150.00,
        "total": 150.00
      },
      {
        "description": "Gás R410A - 1kg",
        "quantity": 2,
        "unit_price": 80.00,
        "total": 160.00
      },
      {
        "description": "Limpeza completa",
        "quantity": 1,
        "unit_price": 100.00,
        "total": 100.00
      }
    ],
    "subtotal": 410.00,
    "discount": 10.00,
    "total": 400.00,
    "status": "pending",
    "valid_until": "2024-12-20",
    "notes": "Orçamento inclui garantia de 90 dias",
    "created_at": "2024-12-10T10:00:00Z"
  }
}
```

#### POST /quotes
Criar orçamento.

**Request**:
```json
{
  "client_id": 1,
  "order_id": 10,
  "description": "Manutenção preventiva",
  "items": [
    {
      "description": "Mão de obra",
      "quantity": 1,
      "unit_price": 150.00
    },
    {
      "description": "Gás R410A - 1kg",
      "quantity": 2,
      "unit_price": 80.00
    }
  ],
  "discount": 10.00,
  "valid_until": "2024-12-20",
  "notes": "Garantia de 90 dias",
  "send_whatsapp": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "quote_number": "ORC-2024-0006",
    "total": 400.00,
    "approval_link": "https://seu-dominio.com/approve/abc123xyz"
  },
  "message": "Orçamento criado e enviado via WhatsApp"
}
```

#### PATCH /quotes/:id/approve
Aprovar orçamento (via link público ou interno).

**Request**:
```json
{
  "notes": "Aprovado pelo cliente via WhatsApp"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "quote_id": 5,
    "order_created": {
      "id": 11,
      "order_number": "OS-2024-0011"
    }
  },
  "message": "Orçamento aprovado. OS criada automaticamente."
}
```

#### PATCH /quotes/:id/reject
Rejeitar orçamento.

**Request**:
```json
{
  "rejection_reason": "Valor acima do esperado"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Orçamento rejeitado"
}
```

#### GET /quotes/:id/pdf
Gerar PDF do orçamento.

**Response** (200):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORC-2024-0005.pdf"

[arquivo PDF binário]
```

---

### 5. Financeiro

#### GET /financial/summary
Resumo financeiro.

**Query Parameters**:
- `start_date`, `end_date`
- `period` (today, week, month, year)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-31"
    },
    "revenue": {
      "total": 15000.00,
      "paid": 12000.00,
      "pending": 3000.00
    },
    "orders": {
      "total": 50,
      "completed": 45,
      "in_progress": 5
    },
    "avg_ticket": 300.00,
    "top_services": [
      {
        "service_type": "refrigeration",
        "count": 30,
        "revenue": 9000.00
      },
      {
        "service_type": "electrical",
        "count": 20,
        "revenue": 6000.00
      }
    ]
  }
}
```

#### GET /financial/payments
Listar pagamentos.

**Query Parameters**:
- `page`, `limit`
- `status` (pending, paid, cancelled)
- `payment_method`
- `start_date`, `end_date`
- `client_id`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 10,
        "order": {
          "id": 5,
          "order_number": "OS-2024-0005"
        },
        "client": {
          "id": 1,
          "name": "Maria Santos"
        },
        "amount": 350.00,
        "payment_method": "pix",
        "status": "paid",
        "due_date": "2024-12-15",
        "paid_at": "2024-12-14T10:30:00Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "total_amount": 5000.00,
      "paid_amount": 4000.00,
      "pending_amount": 1000.00
    }
  }
}
```

#### POST /financial/payments
Registrar pagamento.

**Request**:
```json
{
  "order_id": 10,
  "amount": 350.00,
  "payment_method": "pix",
  "status": "paid",
  "paid_at": "2024-12-14T10:30:00Z",
  "notes": "Pix recebido"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { ... },
  "message": "Pagamento registrado com sucesso"
}
```

#### GET /financial/reports/monthly
Relatório mensal.

**Query Parameters**:
- `year`, `month`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "month": "2024-12",
    "revenue": {
      "total": 15000.00,
      "by_day": [
        { "day": "2024-12-01", "amount": 500.00 },
        { "day": "2024-12-02", "amount": 750.00 }
      ]
    },
    "orders": {
      "total": 50,
      "by_status": {
        "completed": 45,
        "in_progress": 5
      }
    },
    "top_clients": [
      {
        "client_id": 1,
        "name": "Maria Santos",
        "total_spent": 1200.00,
        "order_count": 4
      }
    ]
  }
}
```

---

### 6. Técnicos

#### GET /technicians
Listar técnicos.

**Query Parameters**:
- `specialty` (refrigeration, electrical, both)
- `available` (true/false)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "technicians": [
      {
        "id": 2,
        "name": "João Técnico",
        "specialty": "refrigeration",
        "phone": "(11) 91234-5678",
        "is_available": true,
        "rating": 4.8,
        "total_services": 120,
        "current_orders": 2
      }
    ]
  }
}
```

#### GET /technicians/:id
Detalhes do técnico.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "João Técnico",
    "email": "joao@example.com",
    "specialty": "refrigeration",
    "phone": "(11) 91234-5678",
    "vehicle_plate": "ABC-1234",
    "is_available": true,
    "rating": 4.8,
    "total_services": 120,
    "current_orders": [
      {
        "id": 10,
        "order_number": "OS-2024-0010",
        "status": "in_progress",
        "scheduled_date": "2024-12-12T14:00:00Z"
      }
    ],
    "performance": {
      "avg_completion_time": 3.5,
      "completion_rate": 95,
      "customer_satisfaction": 4.8
    }
  }
}
```

#### POST /technicians
Criar técnico.

**Request**:
```json
{
  "user_id": 5,
  "specialty": "refrigeration",
  "phone": "(11) 91234-5678",
  "vehicle_plate": "ABC-1234"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { ... },
  "message": "Técnico cadastrado com sucesso"
}
```

#### PATCH /technicians/:id/availability
Alterar disponibilidade.

**Request**:
```json
{
  "is_available": false,
  "reason": "Férias até 2024-12-20"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Disponibilidade atualizada"
}
```

---

### 7. Dashboard

#### GET /dashboard/overview
Visão geral do dashboard.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": {
        "total": 5,
        "open": 2,
        "in_progress": 2,
        "completed": 1
      },
      "revenue": 850.00,
      "scheduled_visits": 3
    },
    "week": {
      "orders": 25,
      "revenue": 7500.00,
      "avg_ticket": 300.00
    },
    "month": {
      "orders": 50,
      "revenue": 15000.00,
      "growth": 15.5
    },
    "pending_approvals": {
      "quotes": 3,
      "total_value": 1200.00
    },
    "alerts": [
      {
        "type": "warning",
        "message": "3 OS aguardando atribuição de técnico",
        "action_url": "/orders?status=open"
      },
      {
        "type": "info",
        "message": "5 pagamentos vencem hoje",
        "action_url": "/financial/payments?due_today=true"
      }
    ],
    "upcoming_visits": [
      {
        "order_number": "OS-2024-0010",
        "client_name": "Maria Santos",
        "technician_name": "João Técnico",
        "scheduled_date": "2024-12-12T14:00:00Z",
        "address": "Rua das Flores, 123 - São Paulo"
      }
    ]
  }
}
```

#### GET /dashboard/charts
Dados para gráficos.

**Query Parameters**:
- `period` (week, month, year)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "revenue_by_day": [
      { "date": "2024-12-01", "amount": 500.00 },
      { "date": "2024-12-02", "amount": 750.00 }
    ],
    "orders_by_status": {
      "completed": 45,
      "in_progress": 5,
      "open": 3
    },
    "orders_by_type": {
      "refrigeration": 30,
      "electrical": 20
    },
    "technician_performance": [
      {
        "technician_name": "João Técnico",
        "completed_orders": 25,
        "rating": 4.8
      }
    ]
  }
}
```

---

### 8. WhatsApp

#### POST /whatsapp/send
Enviar mensagem manual.

**Request**:
```json
{
  "phone_number": "5511987654321",
  "message": "Olá! Sua OS foi concluída.",
  "order_id": 10
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message_id": "abc123",
    "status": "sent"
  },
  "message": "Mensagem enviada com sucesso"
}
```

#### GET /whatsapp/logs
Histórico de mensagens.

**Query Parameters**:
- `order_id`
- `client_id`
- `phone_number`
- `start_date`, `end_date`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 100,
        "phone_number": "5511987654321",
        "message_type": "order_created",
        "direction": "outbound",
        "status": "delivered",
        "sent_at": "2024-12-10T09:05:00Z",
        "delivered_at": "2024-12-10T09:05:15Z",
        "read_at": "2024-12-10T09:10:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### GET /whatsapp/status
Status da conexão WhatsApp.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "connected": true,
    "phone_number": "5511999999999",
    "qr_code": null,
    "last_connection": "2024-12-12T00:00:00Z",
    "messages_sent_today": 50
  }
}
```

---

## 📁 Upload de Arquivos

### Limites
- Tamanho máximo por arquivo: 10MB
- Tipos permitidos: jpg, jpeg, png, pdf
- Múltiplos arquivos suportados

### Estrutura de Armazenamento
```
uploads/
├── orders/
│   ├── 10/
│   │   ├── antes.jpg
│   │   ├── durante.jpg
│   │   └── depois.jpg
├── quotes/
│   └── ORC-2024-0005.pdf
└── temp/
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity - Validação falhou |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

---

## 🔒 Rate Limiting

- **Geral**: 100 requisições por minuto por IP
- **Login**: 5 tentativas por minuto por IP
- **Upload**: 10 uploads por minuto por usuário
- **WhatsApp**: 30 mensagens por minuto

---

## 📊 Paginação

Todas as listagens suportam paginação:

**Query Parameters**:
- `page`: Página atual (padrão: 1)
- `limit`: Itens por página (padrão: 20, máx: 100)

**Response**:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 🔍 Busca e Filtros

### Busca Textual
Use o parâmetro `search` para buscar em múltiplos campos:

```
GET /clients?search=maria
GET /orders?search=ar+condicionado
```

### Filtros por Data
```
GET /orders?start_date=2024-12-01&end_date=2024-12-31
GET /financial/payments?due_date_from=2024-12-10&due_date_to=2024-12-20
```

### Ordenação
```
GET /clients?sort_by=name&sort_order=asc
GET /orders?sort_by=created_at&sort_order=desc
```

---

Veja também:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura geral
- [DATABASE.md](DATABASE.md) - Modelo de dados
- [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md) - Integração WhatsApp

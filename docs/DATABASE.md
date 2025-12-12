# Modelo de Banco de Dados

## 📊 Diagrama ER (Entity-Relationship)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │  Clients    │         │ Technicians │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ email       │         │ name        │         │ user_id(FK) │
│ password    │         │ cpf_cnpj    │         │ specialty   │
│ name        │         │ phone       │         │ is_active   │
│ role        │         │ whatsapp    │         └─────────────┘
│ created_at  │         │ email       │               │
└─────────────┘         │ created_at  │               │
      │                 └─────────────┘               │
      │                       │                        │
      │                       │                        │
      │                       │                        │
      │                 ┌─────────────┐               │
      │                 │  Addresses  │               │
      │                 ├─────────────┤               │
      │                 │ id (PK)     │               │
      │                 │ client_id(FK)────────┘      │
      │                 │ street      │               │
      │                 │ number      │               │
      │                 │ city        │               │
      │                 │ state       │               │
      │                 │ zip_code    │               │
      │                 │ latitude    │               │
      │                 │ longitude   │               │
      │                 └─────────────┘               │
      │                       │                        │
      │                       │                        │
      │                 ┌─────────────────┐           │
      │                 │ Service_Orders  │           │
      │                 ├─────────────────┤           │
      └────────────────→│ id (PK)         │           │
                        │ client_id (FK)  │───────────┘
                        │ technician_id(FK)───────────┘
                        │ created_by (FK) │
                        │ order_number    │
                        │ service_type    │
                        │ equipment       │
                        │ problem         │
                        │ status          │
                        │ scheduled_date  │
                        │ completed_date  │
                        │ address_id (FK) │
                        │ notes           │
                        │ created_at      │
                        │ updated_at      │
                        └─────────────────┘
                              │     │
                    ┌─────────┘     └─────────┐
                    │                         │
            ┌───────────────┐         ┌──────────────┐
            │    Photos     │         │    Quotes    │
            ├───────────────┤         ├──────────────┤
            │ id (PK)       │         │ id (PK)      │
            │ order_id (FK) │         │ order_id(FK) │
            │ filename      │         │ quote_number │
            │ filepath      │         │ description  │
            │ filesize      │         │ items (JSON) │
            │ uploaded_at   │         │ subtotal     │
            └───────────────┘         │ discount     │
                                      │ total        │
                                      │ status       │
                                      │ valid_until  │
                                      │ approved_at  │
                                      │ created_at   │
                                      └──────────────┘
                                            │
                                            │
                                      ┌──────────────┐
                                      │   Payments   │
                                      ├──────────────┤
                                      │ id (PK)      │
                                      │ order_id(FK) │
                                      │ quote_id(FK) │
                                      │ amount       │
                                      │ method       │
                                      │ status       │
                                      │ paid_at      │
                                      │ notes        │
                                      └──────────────┘

┌──────────────────┐         ┌─────────────────┐
│ WhatsApp_Logs    │         │    Audit_Logs   │
├──────────────────┤         ├─────────────────┤
│ id (PK)          │         │ id (PK)         │
│ order_id (FK)    │         │ user_id (FK)    │
│ quote_id (FK)    │         │ entity_type     │
│ phone_number     │         │ entity_id       │
│ message_type     │         │ action          │
│ message_text     │         │ old_values(JSON)│
│ status           │         │ new_values(JSON)│
│ sent_at          │         │ ip_address      │
│ delivered_at     │         │ created_at      │
│ read_at          │         └─────────────────┘
└──────────────────┘
```

## 📋 Tabelas Detalhadas

### 1. Users (Usuários do Sistema)

Armazena todos os usuários que acessam o sistema (administradores, gerentes, técnicos).

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'technician', 'client')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

**Campos**:
- `id`: Identificador único
- `email`: Email para login (único)
- `password_hash`: Senha criptografada com bcrypt
- `name`: Nome completo
- `role`: Papel no sistema
  - `admin`: Acesso total
  - `manager`: Gerenciar operações
  - `technician`: Executar serviços
  - `client`: Acesso limitado (portal do cliente)
- `is_active`: Usuário ativo/inativo
- `last_login`: Último acesso

### 2. Clients (Clientes)

Armazena informações dos clientes da empresa.

```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    client_type VARCHAR(20) CHECK (client_type IN ('individual', 'company')),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_cpf_cnpj ON clients(cpf_cnpj);
CREATE INDEX idx_clients_whatsapp ON clients(whatsapp);
CREATE INDEX idx_clients_active ON clients(is_active);

-- Full-text search
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(cpf_cnpj, '')));
```

**Campos**:
- `id`: Identificador único
- `name`: Nome ou razão social
- `cpf_cnpj`: CPF (pessoa física) ou CNPJ (pessoa jurídica)
- `phone`: Telefone principal
- `whatsapp`: Número do WhatsApp (com código do país)
- `email`: Email
- `client_type`: Tipo de cliente
- `notes`: Observações gerais
- `is_active`: Cliente ativo/inativo

### 3. Addresses (Endereços)

Múltiplos endereços por cliente.

```sql
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    label VARCHAR(50), -- Ex: "Casa", "Trabalho", "Loja"
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_addresses_client_id ON addresses(client_id);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_default ON addresses(client_id, is_default);
```

**Campos**:
- `label`: Identificação do endereço
- `latitude/longitude`: Coordenadas para mapa
- `is_default`: Endereço padrão do cliente

### 4. Technicians (Técnicos)

Informações específicas dos técnicos.

```sql
CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(50) NOT NULL CHECK (specialty IN ('refrigeration', 'electrical', 'both')),
    phone VARCHAR(20),
    vehicle_plate VARCHAR(10),
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_services INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_technicians_user_id ON technicians(user_id);
CREATE INDEX idx_technicians_specialty ON technicians(specialty);
CREATE INDEX idx_technicians_available ON technicians(is_available);
```

**Campos**:
- `user_id`: Referência ao usuário
- `specialty`: Especialidade
  - `refrigeration`: Refrigeração
  - `electrical`: Elétrica
  - `both`: Ambas
- `vehicle_plate`: Placa do veículo
- `is_available`: Disponível para novas OS
- `rating`: Avaliação média (0-5)
- `total_services`: Total de serviços realizados

### 5. Service_Orders (Ordens de Serviço)

Núcleo do sistema - todas as ordens de serviço.

```sql
CREATE TABLE service_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    technician_id INTEGER REFERENCES technicians(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    address_id INTEGER REFERENCES addresses(id),
    
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('refrigeration', 'electrical')),
    equipment VARCHAR(255),
    problem TEXT NOT NULL,
    diagnosis TEXT,
    solution TEXT,
    
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (
        status IN ('open', 'assigned', 'in_progress', 'waiting_part', 'completed', 'cancelled')
    ),
    
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    scheduled_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    estimated_cost DECIMAL(10, 2),
    final_cost DECIMAL(10, 2),
    
    notes TEXT,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_orders_order_number ON service_orders(order_number);
CREATE INDEX idx_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_orders_technician_id ON service_orders(technician_id);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_service_type ON service_orders(service_type);
CREATE INDEX idx_orders_scheduled_date ON service_orders(scheduled_date);
CREATE INDEX idx_orders_created_at ON service_orders(created_at DESC);

-- Full-text search
CREATE INDEX idx_orders_search ON service_orders USING gin(
    to_tsvector('portuguese', order_number || ' ' || COALESCE(equipment, '') || ' ' || problem)
);
```

**Campos**:
- `order_number`: Número único da OS (ex: OS-2024-0001)
- `service_type`: Tipo de serviço
- `equipment`: Equipamento (ex: "Ar condicionado Split 12000 BTUs")
- `problem`: Problema reportado
- `diagnosis`: Diagnóstico do técnico
- `solution`: Solução aplicada
- `status`: Status atual
  - `open`: Aberta (aguardando atribuição)
  - `assigned`: Atribuída a técnico
  - `in_progress`: Em andamento
  - `waiting_part`: Aguardando peça
  - `completed`: Concluída
  - `cancelled`: Cancelada
- `priority`: Prioridade

### 6. Photos (Fotos das OS)

Fotos e vídeos anexados às OS.

```sql
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    filesize INTEGER,
    mime_type VARCHAR(50),
    photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'during', 'after')),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_photos_order_id ON photos(order_id);
CREATE INDEX idx_photos_photo_type ON photos(photo_type);
```

**Campos**:
- `photo_type`: Momento da foto
  - `before`: Antes do serviço
  - `during`: Durante o serviço
  - `after`: Após o serviço

### 7. Quotes (Orçamentos)

Orçamentos criados para clientes.

```sql
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES service_orders(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    
    description TEXT,
    items JSONB NOT NULL, -- Array de itens do orçamento
    
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'approved', 'rejected', 'expired')
    ),
    
    valid_until DATE,
    sent_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_order_id ON quotes(order_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
```

**Campos**:
- `quote_number`: Número único (ex: ORC-2024-0001)
- `items`: JSON com itens do orçamento
  ```json
  [
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
    }
  ]
  ```
- `status`: Status do orçamento
- `valid_until`: Data de validade

### 8. Payments (Pagamentos)

Controle financeiro de pagamentos.

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id),
    quote_id INTEGER REFERENCES quotes(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) CHECK (
        payment_method IN ('cash', 'debit_card', 'credit_card', 'pix', 'bank_transfer', 'check')
    ),
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'paid', 'cancelled', 'refunded')
    ),
    
    due_date DATE,
    paid_at TIMESTAMP,
    
    installments INTEGER DEFAULT 1,
    installment_number INTEGER DEFAULT 1,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_quote_id ON payments(quote_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
```

**Campos**:
- `payment_method`: Método de pagamento
- `installments`: Total de parcelas
- `installment_number`: Número da parcela atual
- `due_date`: Data de vencimento
- `paid_at`: Data do pagamento efetivo

### 9. WhatsApp_Logs (Logs de WhatsApp)

Histórico de todas as mensagens enviadas/recebidas.

```sql
CREATE TABLE whatsapp_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id),
    quote_id INTEGER REFERENCES quotes(id),
    client_id INTEGER REFERENCES clients(id),
    
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(30) NOT NULL CHECK (
        message_type IN ('order_created', 'order_assigned', 'order_completed', 
                        'quote_sent', 'visit_reminder', 'payment_reminder', 'custom')
    ),
    
    direction VARCHAR(10) CHECK (direction IN ('outbound', 'inbound')),
    
    message_text TEXT,
    media_url VARCHAR(500),
    
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    failed_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_whatsapp_logs_order_id ON whatsapp_logs(order_id);
CREATE INDEX idx_whatsapp_logs_quote_id ON whatsapp_logs(quote_id);
CREATE INDEX idx_whatsapp_logs_client_id ON whatsapp_logs(client_id);
CREATE INDEX idx_whatsapp_logs_phone_number ON whatsapp_logs(phone_number);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX idx_whatsapp_logs_created_at ON whatsapp_logs(created_at DESC);
```

**Campos**:
- `message_type`: Tipo de mensagem automática
- `direction`: Sentido da mensagem
- `status`: Status de entrega

### 10. Audit_Logs (Logs de Auditoria)

Rastreamento de todas as ações no sistema.

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    
    entity_type VARCHAR(50) NOT NULL, -- Ex: "service_order", "client", "quote"
    entity_id INTEGER NOT NULL,
    
    action VARCHAR(50) NOT NULL CHECK (
        action IN ('create', 'update', 'delete', 'view', 'approve', 'reject')
    ),
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## 🔍 Queries Úteis

### Dashboard - Estatísticas do Dia

```sql
-- Total de OS por status
SELECT 
    status,
    COUNT(*) as total,
    SUM(final_cost) as total_value
FROM service_orders
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY status;

-- Próximas visitas
SELECT 
    so.order_number,
    c.name as client_name,
    c.whatsapp,
    so.scheduled_date,
    t.name as technician_name
FROM service_orders so
JOIN clients c ON c.id = so.client_id
JOIN users t ON t.id = (SELECT user_id FROM technicians WHERE id = so.technician_id)
WHERE so.scheduled_date >= CURRENT_TIMESTAMP
  AND so.status IN ('assigned', 'in_progress')
ORDER BY so.scheduled_date
LIMIT 10;
```

### Relatório Financeiro Mensal

```sql
-- Receita por mês
SELECT 
    DATE_TRUNC('month', paid_at) as month,
    COUNT(*) as total_payments,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_payment
FROM payments
WHERE status = 'paid'
  AND paid_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;

-- Pendências financeiras
SELECT 
    c.name as client_name,
    c.whatsapp,
    SUM(p.amount) as total_pending,
    MIN(p.due_date) as oldest_due_date
FROM payments p
JOIN clients c ON c.id = p.client_id
WHERE p.status = 'pending'
  AND p.due_date < CURRENT_DATE
GROUP BY c.id, c.name, c.whatsapp
ORDER BY total_pending DESC;
```

### Performance de Técnicos

```sql
-- Ranking de técnicos
SELECT 
    u.name as technician_name,
    t.specialty,
    COUNT(so.id) as total_services,
    AVG(EXTRACT(EPOCH FROM (so.completed_at - so.started_at))/3600) as avg_hours,
    t.rating,
    SUM(so.final_cost) as total_revenue
FROM technicians t
JOIN users u ON u.id = t.user_id
LEFT JOIN service_orders so ON so.technician_id = t.id 
    AND so.status = 'completed'
    AND so.completed_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY t.id, u.name, t.specialty, t.rating
ORDER BY total_services DESC;
```

### Histórico do Cliente

```sql
-- Histórico completo de um cliente
SELECT 
    so.order_number,
    so.service_type,
    so.equipment,
    so.status,
    so.created_at,
    so.completed_at,
    so.final_cost,
    u.name as technician_name
FROM service_orders so
LEFT JOIN technicians t ON t.id = so.technician_id
LEFT JOIN users u ON u.id = t.user_id
WHERE so.client_id = ?
ORDER BY so.created_at DESC;
```

## 🔄 Triggers e Functions

### Auto-atualizar updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (aplicar a outras tabelas)
```

### Gerar Número de OS Automático

```sql
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    year_str VARCHAR(4);
BEGIN
    year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM service_orders
    WHERE order_number LIKE 'OS-' || year_str || '-%';
    
    NEW.order_number := 'OS-' || year_str || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON service_orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();
```

## 💾 Backup e Restore

### Backup Completo

```bash
# Backup completo
pg_dump -U postgres -d service_management -F c -b -v -f backup_$(date +%Y%m%d).dump

# Backup apenas schema
pg_dump -U postgres -d service_management -s -f schema_backup.sql

# Backup apenas dados
pg_dump -U postgres -d service_management -a -f data_backup.sql
```

### Restore

```bash
# Restore completo
pg_restore -U postgres -d service_management -v backup_20241212.dump

# Restore de arquivo SQL
psql -U postgres -d service_management -f backup.sql
```

## 📈 Performance

### Análise de Queries Lentas

```sql
-- Habilitar log de queries lentas
ALTER DATABASE service_management SET log_min_duration_statement = 1000;

-- Ver queries mais lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Otimização de Índices

```sql
-- Ver índices não utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename;
```

---

Veja também:
- [ARCHITECTURE.md](ARCHITECTURE.md) para entender a arquitetura geral
- [API.md](API.md) para endpoints que usam estas tabelas

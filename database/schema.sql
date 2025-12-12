-- Sistema de Gestão de Serviços - Schema PostgreSQL
-- Database: service_management

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca textual mais eficiente

-- ============================================================================
-- TABELA: users
-- Usuários do sistema (admin, manager, technician, client)
-- ============================================================================
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

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- TABELA: clients
-- Clientes da empresa
-- ============================================================================
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

-- Índices para clients
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_cpf_cnpj ON clients(cpf_cnpj);
CREATE INDEX idx_clients_whatsapp ON clients(whatsapp);
CREATE INDEX idx_clients_active ON clients(is_active);
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(cpf_cnpj, '')));

-- ============================================================================
-- TABELA: addresses
-- Endereços dos clientes (múltiplos por cliente)
-- ============================================================================
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    label VARCHAR(50),
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

-- Índices para addresses
CREATE INDEX idx_addresses_client_id ON addresses(client_id);
CREATE INDEX idx_addresses_city ON addresses(city);
CREATE INDEX idx_addresses_default ON addresses(client_id, is_default);

-- ============================================================================
-- TABELA: technicians
-- Informações específicas dos técnicos
-- ============================================================================
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

-- Índices para technicians
CREATE INDEX idx_technicians_user_id ON technicians(user_id);
CREATE INDEX idx_technicians_specialty ON technicians(specialty);
CREATE INDEX idx_technicians_available ON technicians(is_available);

-- ============================================================================
-- TABELA: service_orders
-- Ordens de serviço (núcleo do sistema)
-- ============================================================================
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

-- Índices para service_orders
CREATE INDEX idx_orders_order_number ON service_orders(order_number);
CREATE INDEX idx_orders_client_id ON service_orders(client_id);
CREATE INDEX idx_orders_technician_id ON service_orders(technician_id);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_service_type ON service_orders(service_type);
CREATE INDEX idx_orders_scheduled_date ON service_orders(scheduled_date);
CREATE INDEX idx_orders_created_at ON service_orders(created_at DESC);
CREATE INDEX idx_orders_search ON service_orders USING gin(
    to_tsvector('portuguese', order_number || ' ' || COALESCE(equipment, '') || ' ' || problem)
);

-- ============================================================================
-- TABELA: photos
-- Fotos anexadas às ordens de serviço
-- ============================================================================
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

-- Índices para photos
CREATE INDEX idx_photos_order_id ON photos(order_id);
CREATE INDEX idx_photos_photo_type ON photos(photo_type);

-- ============================================================================
-- TABELA: quotes
-- Orçamentos enviados aos clientes
-- ============================================================================
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES service_orders(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    
    description TEXT,
    items JSONB NOT NULL,
    
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

-- Índices para quotes
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_order_id ON quotes(order_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================================================
-- TABELA: payments
-- Controle de pagamentos
-- ============================================================================
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

-- Índices para payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_quote_id ON payments(quote_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================================================
-- TABELA: whatsapp_logs
-- Histórico de mensagens WhatsApp enviadas/recebidas
-- ============================================================================
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

-- Índices para whatsapp_logs
CREATE INDEX idx_whatsapp_logs_order_id ON whatsapp_logs(order_id);
CREATE INDEX idx_whatsapp_logs_quote_id ON whatsapp_logs(quote_id);
CREATE INDEX idx_whatsapp_logs_client_id ON whatsapp_logs(client_id);
CREATE INDEX idx_whatsapp_logs_phone_number ON whatsapp_logs(phone_number);
CREATE INDEX idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX idx_whatsapp_logs_created_at ON whatsapp_logs(created_at DESC);

-- ============================================================================
-- TABELA: audit_logs
-- Logs de auditoria de todas as ações no sistema
-- ============================================================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    
    entity_type VARCHAR(50) NOT NULL,
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

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS E FUNCTIONS
-- ============================================================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at em todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function para gerar número de OS automaticamente
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    year_str VARCHAR(4);
BEGIN
    IF NEW.order_number IS NULL THEN
        year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
        INTO next_number
        FROM service_orders
        WHERE order_number LIKE 'OS-' || year_str || '-%';
        
        NEW.order_number := 'OS-' || year_str || '-' || LPAD(next_number::TEXT, 4, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON service_orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Function para gerar número de orçamento automaticamente
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    year_str VARCHAR(4);
BEGIN
    IF NEW.quote_number IS NULL THEN
        year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 10) AS INTEGER)), 0) + 1
        INTO next_number
        FROM quotes
        WHERE quote_number LIKE 'ORC-' || year_str || '-%';
        
        NEW.quote_number := 'ORC-' || year_str || '-' || LPAD(next_number::TEXT, 4, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_quote_number_trigger
BEFORE INSERT ON quotes
FOR EACH ROW
EXECUTE FUNCTION generate_quote_number();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Dashboard Overview
CREATE OR REPLACE VIEW v_dashboard_overview AS
SELECT 
    (SELECT COUNT(*) FROM service_orders WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
    (SELECT COUNT(*) FROM service_orders WHERE status = 'open') as orders_open,
    (SELECT COUNT(*) FROM service_orders WHERE status = 'in_progress') as orders_in_progress,
    (SELECT COUNT(*) FROM service_orders WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE) as orders_completed_today,
    (SELECT COALESCE(SUM(final_cost), 0) FROM service_orders WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE) as revenue_today,
    (SELECT COALESCE(SUM(final_cost), 0) FROM service_orders WHERE status = 'completed' AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', CURRENT_DATE)) as revenue_month,
    (SELECT COUNT(*) FROM quotes WHERE status = 'pending') as quotes_pending;

-- View: Próximas visitas
CREATE OR REPLACE VIEW v_upcoming_visits AS
SELECT 
    so.id,
    so.order_number,
    c.name as client_name,
    c.whatsapp as client_whatsapp,
    u.name as technician_name,
    so.scheduled_date,
    so.service_type,
    so.equipment,
    a.street || ', ' || a.number || ' - ' || a.city || ', ' || a.state as address
FROM service_orders so
JOIN clients c ON c.id = so.client_id
LEFT JOIN technicians t ON t.id = so.technician_id
LEFT JOIN users u ON u.id = t.user_id
LEFT JOIN addresses a ON a.id = so.address_id
WHERE so.scheduled_date >= CURRENT_TIMESTAMP
  AND so.status IN ('assigned', 'in_progress')
ORDER BY so.scheduled_date;

-- View: Performance de técnicos
CREATE OR REPLACE VIEW v_technician_performance AS
SELECT 
    t.id,
    u.name as technician_name,
    t.specialty,
    t.rating,
    t.total_services,
    COUNT(so.id) FILTER (WHERE so.status = 'completed' AND so.completed_at >= DATE_TRUNC('month', CURRENT_DATE)) as services_this_month,
    COALESCE(SUM(so.final_cost) FILTER (WHERE so.status = 'completed' AND so.completed_at >= DATE_TRUNC('month', CURRENT_DATE)), 0) as revenue_this_month,
    COALESCE(AVG(EXTRACT(EPOCH FROM (so.completed_at - so.started_at))/3600) FILTER (WHERE so.status = 'completed'), 0) as avg_hours_per_service
FROM technicians t
JOIN users u ON u.id = t.user_id
LEFT JOIN service_orders so ON so.technician_id = t.id
WHERE u.is_active = true
GROUP BY t.id, u.name, t.specialty, t.rating, t.total_services;

-- ============================================================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ============================================================================

COMMENT ON TABLE users IS 'Usuários do sistema com diferentes roles';
COMMENT ON TABLE clients IS 'Clientes da empresa';
COMMENT ON TABLE addresses IS 'Endereços dos clientes (múltiplos por cliente)';
COMMENT ON TABLE technicians IS 'Técnicos que executam os serviços';
COMMENT ON TABLE service_orders IS 'Ordens de serviço - núcleo do sistema';
COMMENT ON TABLE photos IS 'Fotos anexadas às ordens de serviço';
COMMENT ON TABLE quotes IS 'Orçamentos enviados aos clientes';
COMMENT ON TABLE payments IS 'Controle de pagamentos';
COMMENT ON TABLE whatsapp_logs IS 'Histórico de mensagens WhatsApp';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações';

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Schema criado com sucesso!';
    RAISE NOTICE 'Total de tabelas: 10';
    RAISE NOTICE 'Total de views: 3';
    RAISE NOTICE 'Total de functions: 3';
END $$;

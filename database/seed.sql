-- Dados de Exemplo para o Sistema de Gestão de Serviços
-- Execute após criar o schema

-- ============================================================================
-- USUÁRIOS
-- Senha padrão para todos: "senha123" (hash bcrypt com salt rounds 10)
-- ============================================================================

INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('admin@empresa.com', '$2b$10$rKvVcPZKz8YH5xvQJ5yJ0O5kKxZZ8y5mYxXYZPMXR0x5xQxPZK0xO', 'Administrador Sistema', 'admin', true),
('gerente@empresa.com', '$2b$10$rKvVcPZKz8YH5xvQJ5yJ0O5kKxZZ8y5mYxXYZPMXR0x5xQxPZK0xO', 'Maria Gerente', 'manager', true),
('joao.tecnico@empresa.com', '$2b$10$rKvVcPZKz8YH5xvQJ5yJ0O5kKxZZ8y5mYxXYZPMXR0x5xQxPZK0xO', 'João Técnico', 'technician', true),
('pedro.tecnico@empresa.com', '$2b$10$rKvVcPZKz8YH5xvQJ5yJ0O5kKxZZ8y5mYxXYZPMXR0x5xQxPZK0xO', 'Pedro Silva', 'technician', true);

-- ============================================================================
-- TÉCNICOS
-- ============================================================================

INSERT INTO technicians (user_id, specialty, phone, vehicle_plate, is_available, rating, total_services) VALUES
(3, 'refrigeration', '(11) 91234-5678', 'ABC-1234', true, 4.8, 120),
(4, 'electrical', '(11) 99876-5432', 'XYZ-9876', true, 4.6, 95);

-- ============================================================================
-- CLIENTES
-- ============================================================================

INSERT INTO clients (name, cpf_cnpj, phone, whatsapp, email, client_type, notes, is_active) VALUES
('Maria Santos', '123.456.789-00', '(11) 98765-4321', '5511987654321', 'maria.santos@email.com', 'individual', 'Cliente VIP - Prioridade alta', true),
('José Silva', '234.567.890-11', '(11) 91234-5678', '5511912345678', 'jose.silva@email.com', 'individual', 'Cliente desde 2023', true),
('Ana Costa Refrigeração Ltda', '12.345.678/0001-90', '(11) 3456-7890', '5511934567890', 'contato@anacostaref.com.br', 'company', 'Empresa parceira - Manutenção mensal', true),
('Carlos Souza', '345.678.901-22', '(11) 99999-8888', '5511999998888', 'carlos.souza@email.com', 'individual', '', true),
('Padaria Pão Quente', '23.456.789/0001-01', '(11) 3333-4444', '5511933334444', 'padaria@paoquente.com', 'company', 'Cliente comercial - câmara fria', true),
('Fernanda Lima', '456.789.012-33', '(11) 97777-6666', '5511977776666', 'fernanda.lima@email.com', 'individual', 'Apartamento - horário flexível', true),
('Ricardo Almeida', '567.890.123-44', '(11) 96666-5555', '5511966665555', 'ricardo.almeida@email.com', 'individual', '', true),
('Supermercado Bom Preço', '34.567.890/0001-12', '(11) 4444-5555', '5511944445555', 'ti@bompreco.com', 'company', 'Múltiplas unidades de refrigeração', true);

-- ============================================================================
-- ENDEREÇOS
-- ============================================================================

INSERT INTO addresses (client_id, label, street, number, complement, neighborhood, city, state, zip_code, latitude, longitude, is_default) VALUES
(1, 'Casa', 'Rua das Flores', '123', 'Apto 45', 'Centro', 'São Paulo', 'SP', '01234-567', -23.550520, -46.633309, true),
(2, 'Casa', 'Av. Paulista', '1000', '', 'Bela Vista', 'São Paulo', 'SP', '01310-100', -23.561684, -46.656140, true),
(3, 'Matriz', 'Rua Comercial', '500', 'Galpão 2', 'Brás', 'São Paulo', 'SP', '03058-000', -23.540370, -46.618530, true),
(4, 'Casa', 'Rua Augusta', '250', '', 'Consolação', 'São Paulo', 'SP', '01305-000', -23.556160, -46.662600, true),
(5, 'Loja', 'Rua do Comércio', '789', '', 'Centro', 'São Paulo', 'SP', '01013-001', -23.545420, -46.638700, true),
(6, 'Apartamento', 'Av. Brigadeiro Faria Lima', '1234', 'Apto 801', 'Jardim Paulistano', 'São Paulo', 'SP', '01452-002', -23.578499, -46.687256, true),
(7, 'Casa', 'Rua dos Pinheiros', '456', '', 'Pinheiros', 'São Paulo', 'SP', '05422-010', -23.564180, -46.682070, true),
(8, 'Filial 1', 'Av. São João', '1500', '', 'Centro', 'São Paulo', 'SP', '01036-100', -23.540100, -46.640300, true),
(8, 'Filial 2', 'Rua da Consolação', '2000', '', 'Consolação', 'São Paulo', 'SP', '01301-100', -23.553100, -46.659900, false);

-- ============================================================================
-- ORDENS DE SERVIÇO
-- ============================================================================

INSERT INTO service_orders (
    order_number, client_id, technician_id, created_by, address_id,
    service_type, equipment, problem, diagnosis, solution,
    status, priority, scheduled_date, started_at, completed_at,
    estimated_cost, final_cost, notes
) VALUES
-- OS Concluídas
('OS-2024-0001', 1, 1, 1, 1, 'refrigeration', 'Ar condicionado Split 12000 BTUs', 'Não está gelando', 'Falta de gás refrigerante', 'Carga de gás R410A realizada', 'completed', 'normal', '2024-11-15 14:00:00', '2024-11-15 14:15:00', '2024-11-15 16:30:00', 300.00, 350.00, 'Cliente satisfeito'),
('OS-2024-0002', 2, 2, 1, 2, 'electrical', 'Quadro de distribuição', 'Disjuntor desarma frequentemente', 'Sobrecarga no circuito', 'Substituição de disjuntor e redistribuição de cargas', 'completed', 'high', '2024-11-20 09:00:00', '2024-11-20 09:30:00', '2024-11-20 12:00:00', 250.00, 280.00, ''),
('OS-2024-0003', 3, 1, 2, 3, 'refrigeration', 'Câmara fria industrial', 'Temperatura instável', 'Termostato com defeito', 'Substituição de termostato digital', 'completed', 'urgent', '2024-11-25 08:00:00', '2024-11-25 08:30:00', '2024-11-25 11:00:00', 450.00, 480.00, 'Garantia estendida aplicada'),
('OS-2024-0004', 4, 2, 1, 4, 'electrical', 'Tomadas residenciais', 'Tomadas queimadas', 'Fiação antiga e sobreaquecimento', 'Troca de fiação e instalação de tomadas novas', 'completed', 'normal', '2024-12-01 15:00:00', '2024-12-01 15:20:00', '2024-12-01 17:00:00', 200.00, 220.00, ''),
('OS-2024-0005', 5, 1, 1, 5, 'refrigeration', 'Freezer vertical comercial', 'Barulho excessivo', 'Compressor com problema', 'Substituição de compressor', 'completed', 'high', '2024-12-05 10:00:00', '2024-12-05 10:30:00', '2024-12-05 14:00:00', 800.00, 850.00, 'Peça em garantia'),

-- OS Em Andamento
('OS-2024-0006', 6, 1, 2, 6, 'refrigeration', 'Ar Split 18000 BTUs', 'Vazamento de água', 'Dreno entupido', 'Limpeza de dreno em andamento', 'in_progress', 'normal', '2024-12-12 14:00:00', '2024-12-12 14:15:00', NULL, 150.00, NULL, 'Técnico no local'),
('OS-2024-0007', 7, 2, 1, 7, 'electrical', 'Iluminação externa', 'Luzes não acendem', NULL, NULL, 'in_progress', 'normal', '2024-12-12 16:00:00', '2024-12-12 16:10:00', NULL, 180.00, NULL, ''),

-- OS Aguardando Peça
('OS-2024-0008', 8, 1, 1, 8, 'refrigeration', 'Balcão refrigerado', 'Não liga', 'Placa eletrônica queimada', NULL, 'waiting_part', 'high', '2024-12-10 11:00:00', '2024-12-10 11:30:00', NULL, 600.00, NULL, 'Peça encomendada - previsão 15/12'),

-- OS Atribuídas (aguardando início)
('OS-2024-0009', 1, 1, 1, 1, 'refrigeration', 'Ar condicionado janela', 'Não liga', NULL, NULL, 'assigned', 'normal', '2024-12-13 09:00:00', NULL, NULL, 200.00, NULL, 'Cliente preferência pela manhã'),
('OS-2024-0010', 2, 2, 2, 2, 'electrical', 'Chuveiro elétrico', 'Não aquece', NULL, NULL, 'assigned', 'high', '2024-12-13 14:00:00', NULL, NULL, 150.00, NULL, ''),

-- OS Abertas (sem técnico)
('OS-2024-0011', 3, NULL, 1, 3, 'refrigeration', 'Geladeira comercial', 'Não gela', NULL, NULL, 'open', 'normal', '2024-12-14 10:00:00', NULL, NULL, 350.00, NULL, ''),
('OS-2024-0012', 4, NULL, 2, 4, 'electrical', 'Instalação de ventilador de teto', 'Novo serviço', NULL, NULL, 'open', 'low', '2024-12-15 15:00:00', NULL, NULL, 180.00, NULL, 'Cliente fornece o ventilador'),

-- OS Cancelada
('OS-2024-0013', 5, NULL, 1, 5, 'refrigeration', 'Ar condicionado', 'Barulho', NULL, NULL, 'cancelled', 'normal', '2024-12-11 10:00:00', NULL, NULL, 200.00, NULL, 'Cliente desistiu do serviço');

-- ============================================================================
-- FOTOS
-- ============================================================================

INSERT INTO photos (order_id, filename, filepath, filesize, mime_type, photo_type, description) VALUES
(1, 'antes_001.jpg', '/uploads/orders/1/antes_001.jpg', 1024000, 'image/jpeg', 'before', 'Ar condicionado antes da manutenção'),
(1, 'depois_001.jpg', '/uploads/orders/1/depois_001.jpg', 1100000, 'image/jpeg', 'after', 'Sistema funcionando após carga de gás'),
(3, 'camara_problema.jpg', '/uploads/orders/3/camara_problema.jpg', 2048000, 'image/jpeg', 'before', 'Termostato danificado'),
(3, 'termostato_novo.jpg', '/uploads/orders/3/termostato_novo.jpg', 1800000, 'image/jpeg', 'after', 'Novo termostato instalado'),
(6, 'dreno_entupido.jpg', '/uploads/orders/6/dreno_entupido.jpg', 1500000, 'image/jpeg', 'during', 'Dreno sendo limpo');

-- ============================================================================
-- ORÇAMENTOS
-- ============================================================================

INSERT INTO quotes (
    quote_number, order_id, client_id, created_by,
    description, items, subtotal, discount, total,
    status, valid_until, sent_at, notes
) VALUES
-- Orçamento aprovado (gerou OS-0001)
('ORC-2024-0001', 1, 1, 1,
'Manutenção preventiva + carga de gás',
'[
    {"description": "Mão de obra - Manutenção preventiva", "quantity": 1, "unit_price": 150.00, "total": 150.00},
    {"description": "Gás R410A - 1kg", "quantity": 2, "unit_price": 80.00, "total": 160.00},
    {"description": "Limpeza de filtros", "quantity": 1, "unit_price": 50.00, "total": 50.00}
]'::jsonb,
360.00, 10.00, 350.00, 'approved', '2024-11-20', '2024-11-10 10:00:00', 'Garantia de 90 dias'),

-- Orçamento pendente
('ORC-2024-0002', 11, 3, 2,
'Reparo de geladeira comercial',
'[
    {"description": "Diagnóstico completo", "quantity": 1, "unit_price": 80.00, "total": 80.00},
    {"description": "Mão de obra - Reparo", "quantity": 1, "unit_price": 200.00, "total": 200.00},
    {"description": "Peças diversas", "quantity": 1, "unit_price": 150.00, "total": 150.00}
]'::jsonb,
430.00, 30.00, 400.00, 'sent', '2024-12-20', '2024-12-12 09:00:00', 'Orçamento enviado via WhatsApp'),

-- Orçamento rejeitado
('ORC-2024-0003', NULL, 4, 1,
'Instalação de ar condicionado novo',
'[
    {"description": "Ar Split 12000 BTUs Inverter", "quantity": 1, "unit_price": 1800.00, "total": 1800.00},
    {"description": "Mão de obra - Instalação", "quantity": 1, "unit_price": 350.00, "total": 350.00},
    {"description": "Material de instalação", "quantity": 1, "unit_price": 200.00, "total": 200.00}
]'::jsonb,
2350.00, 50.00, 2300.00, 'rejected', '2024-12-10', '2024-12-01 14:00:00', 'Cliente achou valor alto');

-- ============================================================================
-- PAGAMENTOS
-- ============================================================================

INSERT INTO payments (
    order_id, quote_id, client_id,
    amount, payment_method, status,
    due_date, paid_at, installments, installment_number, notes
) VALUES
-- Pagamentos realizados
(1, 1, 1, 350.00, 'pix', 'paid', '2024-11-15', '2024-11-15 17:00:00', 1, 1, 'Pago no local via PIX'),
(2, NULL, 2, 280.00, 'credit_card', 'paid', '2024-11-20', '2024-11-20 12:30:00', 1, 1, 'Cartão Visa'),
(3, NULL, 3, 480.00, 'bank_transfer', 'paid', '2024-11-30', '2024-11-28 10:00:00', 1, 1, 'Transferência bancária'),
(4, NULL, 4, 220.00, 'cash', 'paid', '2024-12-01', '2024-12-01 17:30:00', 1, 1, 'Dinheiro'),
(5, NULL, 5, 850.00, 'pix', 'paid', '2024-12-05', '2024-12-05 14:30:00', 1, 1, 'PIX'),

-- Pagamentos pendentes
(6, NULL, 6, 150.00, 'pix', 'pending', '2024-12-15', NULL, 1, 1, 'Aguardando conclusão do serviço'),
(7, NULL, 7, 180.00, 'cash', 'pending', '2024-12-15', NULL, 1, 1, 'A receber'),
(8, NULL, 8, 600.00, 'bank_transfer', 'pending', '2024-12-20', NULL, 1, 1, 'Aguardando chegada da peça');

-- ============================================================================
-- LOGS DE WHATSAPP
-- ============================================================================

INSERT INTO whatsapp_logs (
    order_id, quote_id, client_id, phone_number, message_type,
    direction, message_text, status,
    sent_at, delivered_at, read_at
) VALUES
(1, NULL, 1, '5511987654321', 'order_created', 'outbound',
'🔧 *Nova Ordem de Serviço*

Olá Maria Santos!

Sua ordem de serviço foi criada com sucesso:

📋 *Número:* OS-2024-0001
🛠️ *Tipo:* Refrigeração
📦 *Equipamento:* Ar condicionado Split 12000 BTUs
📅 *Data agendada:* 15/11/2024 14:00

Em breve um técnico será designado para atender você.

Obrigado pela preferência! 😊',
'read', '2024-11-10 09:05:00', '2024-11-10 09:05:15', '2024-11-10 09:10:00'),

(1, NULL, 1, '5511987654321', 'order_assigned', 'outbound',
'👨‍🔧 *Técnico Designado*

Olá Maria Santos!

Sua OS OS-2024-0001 foi atribuída ao técnico:

👤 *Técnico:* João Técnico
📱 *Contato:* (11) 91234-5678
📅 *Data/Hora:* 15/11/2024 14:00

O técnico entrará em contato em breve para confirmar o horário.',
'read', '2024-11-10 10:00:00', '2024-11-10 10:00:20', '2024-11-10 10:05:00'),

(1, NULL, 1, '5511987654321', 'visit_reminder', 'outbound',
'⏰ *Lembrete de Visita*

Olá Maria Santos!

Lembramos que amanhã temos uma visita agendada:

📋 *OS:* OS-2024-0001
👨‍🔧 *Técnico:* João Técnico
📅 *Data/Hora:* 15/11/2024 14:00
📍 *Local:* Rua das Flores, 123 - São Paulo

Se precisar reagendar, entre em contato conosco.

Até amanhã! 👋',
'read', '2024-11-14 18:00:00', '2024-11-14 18:00:10', '2024-11-14 18:15:00'),

(1, NULL, 1, '5511987654321', 'order_completed', 'outbound',
'✅ *Serviço Concluído*

Olá Maria Santos!

Sua OS OS-2024-0001 foi concluída com sucesso!

👨‍🔧 *Técnico:* João Técnico
🔧 *Solução:* Carga de gás R410A realizada
💰 *Valor:* R$ 350,00

Esperamos ter atendido suas expectativas!

Obrigado! 😊',
'read', '2024-11-15 16:35:00', '2024-11-15 16:35:08', '2024-11-15 16:40:00'),

(NULL, 2, 3, '5511934567890', 'quote_sent', 'outbound',
'💰 *Orçamento Pronto*

Olá Ana Costa Refrigeração Ltda!

Seu orçamento está pronto:

📋 *Número:* ORC-2024-0002
💵 *Valor total:* R$ 400,00
⏰ *Válido até:* 20/12/2024

Para ver os detalhes e aprovar, acesse:
https://sistema.empresa.com/approve/xyz123

Qualquer dúvida, estamos à disposição!',
'delivered', '2024-12-12 09:05:00', '2024-12-12 09:05:12', NULL);

-- ============================================================================
-- LOGS DE AUDITORIA
-- ============================================================================

INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_values, new_values, ip_address) VALUES
(1, 'service_order', 1, 'create', NULL, '{"order_number": "OS-2024-0001", "status": "open"}'::jsonb, '192.168.1.100'),
(1, 'service_order', 1, 'update', '{"status": "open"}'::jsonb, '{"status": "assigned", "technician_id": 1}'::jsonb, '192.168.1.100'),
(3, 'service_order', 1, 'update', '{"status": "assigned"}'::jsonb, '{"status": "in_progress"}'::jsonb, '192.168.1.105'),
(3, 'service_order', 1, 'update', '{"status": "in_progress"}'::jsonb, '{"status": "completed", "final_cost": 350.00}'::jsonb, '192.168.1.105'),
(2, 'quote', 1, 'create', NULL, '{"quote_number": "ORC-2024-0001", "status": "pending"}'::jsonb, '192.168.1.101'),
(2, 'quote', 1, 'update', '{"status": "pending"}'::jsonb, '{"status": "sent"}'::jsonb, '192.168.1.101'),
(1, 'quote', 1, 'approve', '{"status": "sent"}'::jsonb, '{"status": "approved"}'::jsonb, '192.168.1.100');

-- ============================================================================
-- MENSAGEM DE CONCLUSÃO
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Dados de exemplo inseridos com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Resumo:';
    RAISE NOTICE '  - 4 usuários (1 admin, 1 gerente, 2 técnicos)';
    RAISE NOTICE '  - 8 clientes (6 PF, 2 PJ)';
    RAISE NOTICE '  - 9 endereços';
    RAISE NOTICE '  - 13 ordens de serviço (5 concluídas, 2 em andamento, 1 aguardando peça, 2 atribuídas, 2 abertas, 1 cancelada)';
    RAISE NOTICE '  - 5 fotos anexadas';
    RAISE NOTICE '  - 3 orçamentos (1 aprovado, 1 pendente, 1 rejeitado)';
    RAISE NOTICE '  - 8 pagamentos (5 pagos, 3 pendentes)';
    RAISE NOTICE '  - 5 mensagens WhatsApp';
    RAISE NOTICE '  - 7 logs de auditoria';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Credenciais de acesso:';
    RAISE NOTICE '  Admin:    admin@empresa.com / senha123';
    RAISE NOTICE '  Gerente:  gerente@empresa.com / senha123';
    RAISE NOTICE '  Técnico:  joao.tecnico@empresa.com / senha123';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Próximos passos:';
    RAISE NOTICE '  1. Configure o backend e inicie o servidor';
    RAISE NOTICE '  2. Configure o frontend';
    RAISE NOTICE '  3. Configure a integração WhatsApp';
    RAISE NOTICE '  4. Faça login e explore o sistema!';
END $$;

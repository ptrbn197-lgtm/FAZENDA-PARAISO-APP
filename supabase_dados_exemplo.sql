-- ==============================================
-- DADOS DE EXEMPLO PARA POPULAR O BANCO
-- Execute DEPOIS do supabase_schema_SIMPLES.sql
-- ==============================================

-- ==============================================
-- DADOS DE ESTIMULAÇÃO
-- ==============================================
INSERT INTO public.stimulation_records 
(task_section, worker_name, worker_id, application_date, notes, registered_by, registered_by_name)
VALUES
('A1', 'João Silva', 'worker-001', '2025-01-15', 'Aplicação de estimulante padrão', 'admin-001', 'Administrador'),
('A2', 'Maria Santos', 'worker-002', '2025-01-16', 'Aplicação de estimulante padrão', 'admin-001', 'Administrador'),
('B1', 'Pedro Oliveira', 'worker-003', '2025-01-17', 'Aplicação com dosagem reforçada', 'admin-001', 'Administrador'),
('B2', 'Ana Costa', 'worker-004', '2025-01-18', 'Aplicação de estimulante padrão', 'admin-001', 'Administrador'),
('C1', 'Carlos Souza', 'worker-005', '2025-01-19', 'Primeira aplicação do ano', 'admin-001', 'Administrador')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE CONTROLE DE PRAGAS
-- ==============================================
INSERT INTO public.pest_control_records 
(task_section, worker_name, worker_id, pest_type, pest_species, control_method, control_type, 
 product_used, application_date, status, severity, affected_area, affected_trees_count, 
 affected_hectares, notes, epi_used, dosage_used, registered_by, registered_by_name)
VALUES
('A1', 'João Silva', 'worker-001', 'formigas', 'Atta sexdens', 'Formicida granulado', 'quimico', 
 'Mirex-S', '2025-01-10', 'controlado', 'media', 'Setor A1 - linha 3 a 5', 45, 0.8, 
 'Aplicação preventiva após identificação de formigueiros', true, '200g por formigueiro', 'admin-001', 'Administrador'),

('B2', 'Ana Costa', 'worker-004', 'fungos', 'Microcyclus ulei', 'Fungicida sistêmico', 'quimico', 
 'Score 250 EC', '2025-01-12', 'em-tratamento', 'alta', 'Setor B2 - área central', 120, 2.5, 
 'Ataque de mal das folhas - tratamento emergencial', true, '300ml/100L água', 'admin-001', 'Administrador'),

('C1', 'Carlos Souza', 'worker-005', 'ervas-daninhas', NULL, 'Roçagem manual', 'cultural', 
 'Sem produto químico', '2025-01-14', 'controlado', 'baixa', 'Setor C1', 0, 1.2, 
 'Controle cultural de plantas invasoras', false, NULL, 'admin-001', 'Administrador'),

('A2', 'Maria Santos', 'worker-002', 'insetos', 'Leptopharsa heveae', 'Inseticida de contato', 'quimico', 
 'Decis 25 EC', '2025-01-16', 'monitoramento', 'media', 'Setor A2 - bordadura', 78, 1.5, 
 'Percevejo de renda - população ainda em nível aceitável', true, '200ml/ha', 'admin-001', 'Administrador'),

('B1', 'Pedro Oliveira', 'worker-003', 'doencas', 'Phytophthora spp', 'Controle integrado', 'integrado', 
 'Aliette + Ridomil', '2025-01-18', 'em-tratamento', 'alta', 'Setor B1 - área baixa', 95, 1.8, 
 'Podridão de raízes - drenagem + tratamento químico', true, '2kg/ha + 1.5kg/ha', 'admin-001', 'Administrador')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE MAPEAMENTO DE ÁREAS
-- ==============================================
INSERT INTO public.pest_control_area_maps 
(task_section, worker_name, worker_id, plant_age, total_trees, hectares, pest_history, 
 last_inspection_date, soil_type, irrigation_type, notes)
VALUES
('A1', 'João Silva', 'worker-001', 8, 450, 3.2, ARRAY['formigas-2024', 'mal-das-folhas-2023'], 
 '2025-01-20', 'Latossolo Vermelho', 'Sem irrigação', 'Área com bom desenvolvimento'),

('A2', 'Maria Santos', 'worker-002', 7, 420, 3.0, ARRAY['percevejo-2024'], 
 '2025-01-19', 'Latossolo Amarelo', 'Sem irrigação', 'Bordadura requer atenção especial'),

('B1', 'Pedro Oliveira', 'worker-003', 10, 500, 3.5, ARRAY['podridao-raizes-2024', 'formigas-2023'], 
 '2025-01-21', 'Argissolo', 'Sem irrigação', 'Área baixa - atenção à drenagem'),

('B2', 'Ana Costa', 'worker-004', 9, 480, 3.3, ARRAY['mal-das-folhas-2024', 'mal-das-folhas-2023'], 
 '2025-01-18', 'Latossolo Vermelho', 'Sem irrigação', 'Alta incidência de fungos'),

('C1', 'Carlos Souza', 'worker-005', 6, 380, 2.8, ARRAY['ervas-daninhas-2024'], 
 '2025-01-22', 'Neossolo', 'Sem irrigação', 'Área recém formada')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE AGENDAMENTO DE INSPEÇÕES
-- ==============================================
INSERT INTO public.pest_inspection_schedules 
(task_section, worker_name, worker_id, scheduled_date, frequency, inspector_id, 
 inspector_name, status, completed_date, findings)
VALUES
('A1', 'João Silva', 'worker-001', '2025-02-01', 'mensal', 'inspector-001', 
 'José Inspetor', 'agendada', NULL, NULL),

('A2', 'Maria Santos', 'worker-002', '2025-01-25', 'quinzenal', 'inspector-001', 
 'José Inspetor', 'realizada', '2025-01-25', 'Área limpa, sem novas infestações'),

('B1', 'Pedro Oliveira', 'worker-003', '2025-02-05', 'semanal', 'inspector-002', 
 'Maria Inspetora', 'agendada', NULL, NULL),

('B2', 'Ana Costa', 'worker-004', '2025-01-28', 'semanal', 'inspector-001', 
 'José Inspetor', 'agendada', NULL, NULL),

('C1', 'Carlos Souza', 'worker-005', '2025-02-10', 'mensal', 'inspector-002', 
 'Maria Inspetora', 'agendada', NULL, NULL)
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE TREINAMENTOS
-- ==============================================
INSERT INTO public.pest_control_trainings 
(training_date, training_topic, trainer, participants, participant_names, duration, 
 topics, certificate, notes, registered_by, registered_by_name)
VALUES
('2025-01-05', 'Identificação e Controle de Pragas', 'Dr. Agrônomo Silva', 
 ARRAY['worker-001', 'worker-002', 'worker-003', 'worker-004', 'worker-005'], 
 ARRAY['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza'], 
 4, 
 ARRAY['Identificação de pragas comuns', 'Métodos de controle', 'Uso de EPIs', 'Aplicação de defensivos'], 
 true, 
 'Treinamento obrigatório anual', 
 'admin-001', 'Administrador'),

('2025-01-12', 'Uso Seguro de Agroquímicos', 'Eng. Segurança do Trabalho', 
 ARRAY['worker-001', 'worker-002', 'worker-003'], 
 ARRAY['João Silva', 'Maria Santos', 'Pedro Oliveira'], 
 3, 
 ARRAY['EPIs obrigatórios', 'Armazenamento de produtos', 'Primeiros socorros', 'Destinação de embalagens'], 
 true, 
 'Reciclagem anual - NR 31', 
 'admin-001', 'Administrador')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE RANKING (AVALIAÇÕES DE DESEMPENHO)
-- ==============================================
INSERT INTO public.worker_performance_ratings 
(worker_id, worker_name, month, production_score, quality_score, discipline_score, 
 overall_score, notes, rated_by, rated_by_name)
VALUES
('worker-001', 'João Silva', '2025-01', 9.5, 9.0, 10.0, 9.5, 
 'Excelente desempenho em todos os quesitos. Pontualidade exemplar.', 
 'admin-001', 'Administrador'),

('worker-002', 'Maria Santos', '2025-01', 8.5, 9.5, 9.0, 9.0, 
 'Ótima qualidade nas tarefas. Produção acima da média.', 
 'admin-001', 'Administrador'),

('worker-003', 'Pedro Oliveira', '2025-01', 9.0, 8.5, 9.5, 9.0, 
 'Bom desempenho geral. Melhorou técnica de sangria.', 
 'admin-001', 'Administrador'),

('worker-004', 'Ana Costa', '2025-01', 8.0, 9.0, 8.5, 8.5, 
 'Desempenho satisfatório. Necessita atenção na produtividade.', 
 'admin-001', 'Administrador'),

('worker-005', 'Carlos Souza', '2025-01', 7.5, 8.0, 9.0, 8.2, 
 'Desempenho adequado. Em treinamento para melhorar produção.', 
 'admin-001', 'Administrador'),

-- Dados do mês anterior para comparação
('worker-001', 'João Silva', '2024-12', 9.0, 9.0, 10.0, 9.3, 
 'Manteve alto padrão de qualidade.', 
 'admin-001', 'Administrador'),

('worker-002', 'Maria Santos', '2024-12', 8.0, 9.0, 9.0, 8.7, 
 'Boa evolução na produtividade.', 
 'admin-001', 'Administrador'),

('worker-003', 'Pedro Oliveira', '2024-12', 8.5, 8.0, 9.0, 8.5, 
 'Desempenho consistente.', 
 'admin-001', 'Administrador')
ON CONFLICT DO NOTHING;

-- ==============================================
-- DADOS DE PRESENÇA/FREQUÊNCIA
-- ==============================================
INSERT INTO public.attendance_records 
(worker_id, worker_name, date, status, task_section, rainfall_mm, notes, 
 registered_by, registered_by_name)
VALUES
('worker-001', 'João Silva', '2025-01-20', 'sangria-realizada', 'A1', NULL, 
 'Trabalho normal', 'admin-001', 'Administrador'),

('worker-002', 'Maria Santos', '2025-01-20', 'sangria-realizada', 'A2', NULL, 
 'Trabalho normal', 'admin-001', 'Administrador'),

('worker-003', 'Pedro Oliveira', '2025-01-20', 'falta-chuva', 'B1', 45.5, 
 'Chuva intensa impossibilitou sangria', 'admin-001', 'Administrador'),

('worker-004', 'Ana Costa', '2025-01-21', 'sangria-realizada', 'B2', NULL, 
 'Trabalho normal', 'admin-001', 'Administrador'),

('worker-005', 'Carlos Souza', '2025-01-21', 'falta', NULL, NULL, 
 'Falta não justificada', 'admin-001', 'Administrador'),

('worker-003', 'Pedro Oliveira', '2025-01-22', 'tarefa-recuperada', 'B1', NULL, 
 'Recuperação do dia 20/01', 'admin-001', 'Administrador')
ON CONFLICT DO NOTHING;

-- ==============================================
-- FIM DO SCRIPT
-- ==============================================

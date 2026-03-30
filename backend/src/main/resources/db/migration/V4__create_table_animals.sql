-- 1. Criação da tabela principal de animais com o caminho da imagem
CREATE TABLE animals (
    group_number INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_path VARCHAR(100) NOT NULL -- Ex: 'avestruz.png' [cite: 335]
);

-- 2. Tabela auxiliar para as 4 dezenas de cada animal (Regra de Negócio de 4 em 4) [cite: 42, 43]
CREATE TABLE animal_tens (
    animal_group INT,
    ten VARCHAR(2) NOT NULL,
    PRIMARY KEY (animal_group, ten),
    CONSTRAINT fk_animal_group FOREIGN KEY (animal_group) REFERENCES animals(group_number)
);

-- 3. Inserção dos 25 animais com seus respectivos nomes e caminhos de imagem [cite: 44, 362]
INSERT INTO animals (group_number, name, image_path) VALUES 
(1, 'Avestruz', 'avestruz.png'), (2, 'Águia', 'aguia.png'), (3, 'Burro', 'burro.png'), 
(4, 'Borboleta', 'borboleta.png'), (5, 'Cachorro', 'cachorro.png'), (6, 'Cabra', 'cabra.png'), 
(7, 'Carneiro', 'carneiro.png'), (8, 'Camelo', 'camelo.png'), (9, 'Cobra', 'cobra.png'), 
(10, 'Coelho', 'coelho.png'), (11, 'Cavalo', 'cavalo.png'), (12, 'Elefante', 'elefante.png'), 
(13, 'Galo', 'galo.png'), (14, 'Gato', 'gato.png'), (15, 'Jacaré', 'jacare.png'), 
(16, 'Leão', 'leao.png'), (17, 'Macaco', 'macaco.png'), (18, 'Porco', 'porco.png'), 
(19, 'Pavão', 'pavao.png'), (20, 'Peru', 'peru.png'), (21, 'Touro', 'touro.png'), 
(22, 'Tigre', 'tigre.png'), (23, 'Urso', 'urso.png'), (24, 'Veado', 'veado.png'), 
(25, 'Vaca', 'vaca.png');

-- 4. Inserção das 100 dezenas distribuídas conforme a RN [cite: 44, 362]
INSERT INTO animal_tens (animal_group, ten) VALUES
(1, '01'), (1, '02'), (1, '03'), (1, '04'), (2, '05'), (2, '06'), (2, '07'), (2, '08'),
(3, '09'), (3, '10'), (3, '11'), (3, '12'), (4, '13'), (4, '14'), (4, '15'), (4, '16'),
(5, '17'), (5, '18'), (5, '19'), (5, '20'), (6, '21'), (6, '22'), (6, '23'), (6, '24'),
(7, '25'), (7, '26'), (7, '27'), (7, '28'), (8, '29'), (8, '30'), (8, '31'), (8, '32'),
(9, '33'), (9, '34'), (9, '35'), (9, '36'), (10, '37'), (10, '38'), (10, '39'), (10, '40'),
(11, '41'), (11, '42'), (11, '43'), (11, '44'), (12, '45'), (12, '46'), (12, '47'), (12, '48'),
(13, '49'), (13, '50'), (13, '51'), (13, '52'), (14, '53'), (14, '54'), (14, '55'), (14, '56'),
(15, '57'), (15, '58'), (15, '59'), (15, '60'), (16, '61'), (16, '62'), (16, '63'), (16, '64'),
(17, '65'), (17, '66'), (17, '67'), (17, '68'), (18, '69'), (18, '70'), (18, '71'), (18, '72'),
(19, '73'), (19, '74'), (19, '75'), (19, '76'), (20, '77'), (20, '78'), (20, '79'), (20, '80'),
(21, '81'), (21, '82'), (21, '83'), (21, '84'), (22, '85'), (22, '86'), (22, '87'), (22, '88'),
(23, '89'), (23, '90'), (23, '91'), (23, '92'), (24, '93'), (24, '94'), (24, '95'), (24, '96'),
(25, '97'), (25, '98'), (25, '99'), (25, '00');

-- 5. Atualização da tabela de apostas
ALTER TABLE bets ADD COLUMN animal_group INT;

-- 6. REMOÇÃO da coluna antiga de nome para evitar redundância (Normalização)
ALTER TABLE bets DROP COLUMN animal_name;

-- 7. Criação da Chave Estrangeira (FK)
ALTER TABLE bets ADD CONSTRAINT fk_bet_animal 
    FOREIGN KEY (animal_group) REFERENCES animals(group_number);
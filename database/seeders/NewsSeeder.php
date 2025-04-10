<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user or create one if none exists
        $author = User::where('is_admin', true)->first() ?? User::first();

        if (! $author) {
            $this->command->error('No users found. Please run UserSeeder first.');

            return;
        }

        // Sample news articles
        $newsArticles = [
            [
                'title' => 'Nova Oportunidade de Estágio para Alunos de Engenharia',
                'content' => '<p>A empresa <strong>XYZ Technology</strong> está oferecendo vagas de estágio para alunos de Engenharia da Computação, Elétrica e Mecânica. Os interessados devem estar cursando a partir do 3º ano e ter conhecimentos em programação e inglês intermediário.</p>

                <p>As inscrições estão abertas até o dia 30 de Maio de 2023 e podem ser feitas através do site da empresa. A bolsa oferecida é de R$ 1.800,00 mais benefícios como vale-transporte e vale-refeição.</p>

                <p>Para mais informações, visite o Departamento de Carreiras da universidade ou acesse o portal de vagas no site institucional.</p>',
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Inscrições Abertas para Programa de Intercâmbio 2023/2024',
                'content' => '<p>Estão abertas as inscrições para o programa de intercâmbio acadêmico internacional para o ano letivo 2023/2024. Os alunos interessados poderão escolher entre mais de 50 universidades parceiras em 20 países diferentes.</p>

                <p>Para participar, é necessário ter completado pelo menos 2 semestres do curso atual, possuir bom desempenho acadêmico (média mínima de 7.0) e comprovar proficiência no idioma da instituição de destino.</p>

                <p>As bolsas de estudo disponíveis cobrem desde taxas acadêmicas até despesas de moradia e alimentação, dependendo do programa e da universidade escolhida.</p>

                <p>Os interessados devem comparecer à reunião informativa que acontecerá no auditório principal no dia 15 de junho às 14h.</p>',
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Palestras sobre Inovação e Empreendedorismo na próxima semana',
                'content' => '<p>Na próxima semana, nossa instituição sediará uma série de palestras sobre Inovação e Empreendedorismo com convidados especiais do mercado e academia.</p>

                <p>Entre os palestrantes confirmados estão fundadores de startups de sucesso, investidores de venture capital e pesquisadores renomados na área de inovação tecnológica.</p>

                <p>Os temas abordados incluem:</p>
                <ul>
                    <li>Como transformar uma ideia em um negócio viável</li>
                    <li>Captação de investimentos para startups</li>
                    <li>Inovação dentro de grandes empresas</li>
                    <li>Tendências tecnológicas para os próximos anos</li>
                </ul>

                <p>O evento é gratuito para alunos e ex-alunos da instituição. Vagas limitadas!</p>',
                'is_published' => true,
                'published_at' => now()->subDay(),
            ],
            [
                'title' => 'Novo Laboratório de Inteligência Artificial será inaugurado no próximo mês',
                'content' => '<p>Temos o prazer de anunciar que nosso novo Laboratório de Inteligência Artificial e Aprendizado de Máquina será inaugurado no próximo mês.</p>

                <p>Equipado com estações de trabalho de última geração, incluindo GPUs de alta performance e servidores dedicados, o laboratório permitirá que alunos e pesquisadores desenvolvam projetos avançados nas áreas de:</p>
                <ul>
                    <li>Visão Computacional</li>
                    <li>Processamento de Linguagem Natural</li>
                    <li>Sistemas de Recomendação</li>
                    <li>Aprendizado por Reforço</li>
                </ul>

                <p>O investimento de R$ 2 milhões foi possível graças à parceria com empresas do setor tecnológico e agências de fomento à pesquisa.</p>

                <p>A cerimônia de inauguração acontecerá no dia 15 do próximo mês, com a presença de autoridades e representantes das empresas parceiras.</p>',
                'is_published' => true,
                'published_at' => now()->subWeeks(2),
            ],
            [
                'title' => 'Resultados do Desafio de Programação 2023',
                'content' => '<p>Foram divulgados os resultados do Desafio de Programação 2023, competição anual que reúne os melhores talentos em desenvolvimento de software da nossa instituição.</p>

                <p>A equipe vencedora, composta pelos alunos Ana Silva, Carlos Mendes e Pedro Oliveira, do 4º ano de Ciência da Computação, impressionou os jurados com uma solução inovadora para o problema de otimização logística apresentado.</p>

                <p>O segundo lugar ficou com a equipe do curso de Engenharia de Software, e o terceiro com alunos de Sistemas de Informação.</p>

                <p>Os vencedores receberão como prêmio um estágio remunerado na empresa patrocinadora do evento, além de equipamentos eletrônicos e cursos de especialização.</p>

                <p>Parabenizamos todos os participantes pelo excelente nível técnico demonstrado durante a competição!</p>',
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
        ];

        // Insert the news articles
        foreach ($newsArticles as $article) {
            News::create([
                'title' => $article['title'],
                'content' => $article['content'],
                'author_id' => $author->id,
                'is_published' => $article['is_published'],
                'published_at' => $article['published_at'],
            ]);
        }

        $this->command->info('Sample news articles created successfully!');
    }
}

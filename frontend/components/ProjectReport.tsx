import React from 'react';

interface ProjectReportProps {
  projectCosts: { name: string; total: number }[];
}

const ProjectReport: React.FC<ProjectReportProps> = ({ projectCosts }) => {
  if (projectCosts.length === 0) {
    return <p className="text-center text-gray-500 py-10">Não há dados de projetos para exibir. Adicione locações para ver o relatório.</p>;
  }

  const maxCost = Math.max(...projectCosts.map(p => p.total), 0);

  const totalOverallCost = projectCosts.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Custos Totais por Projeto</h3>
        <div className="space-y-4">
          {projectCosts.map(({ name, total }) => (
            <div key={name} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <p className="md:col-span-1 font-medium text-gray-800 truncate" title={name}>{name}</p>
              <div className="md:col-span-2">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-emerald-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-sm font-bold"
                    style={{ width: maxCost > 0 ? `${(total / maxCost) * 100}%` : '0%' }}
                    aria-valuenow={total}
                    aria-valuemin={0}
                    aria-valuemax={maxCost}
                  >
                  </div>
                </div>
              </div>
              <p className="md:col-span-1 font-mono text-right text-gray-700">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 pt-4 border-t-2 border-gray-200 flex justify-end">
        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">Custo Geral Total</p>
          <p className="text-2xl font-mono font-bold text-emerald-600">
            R$ {totalOverallCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectReport;

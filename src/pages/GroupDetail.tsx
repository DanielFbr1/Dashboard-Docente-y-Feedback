
import { DetalleGrupo } from '../components/DetalleGrupo';
import { Grupo, ProyectoFase } from '../types';

interface GroupDetailProps {
    grupo: Grupo;
    fases: ProyectoFase[];
    onBack: () => void;
    onViewFeedback?: () => void;
}

export function GroupDetail({ grupo, fases, onBack, onViewFeedback }: GroupDetailProps) {
    return (
        <DetalleGrupo
            grupo={grupo}
            fases={fases}
            onBack={onBack}
            onViewFeedback={onViewFeedback}
        />
    );
}

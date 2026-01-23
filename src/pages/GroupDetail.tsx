
import { DetalleGrupo } from '../components/DetalleGrupo';
import { Grupo } from '../types';

interface GroupDetailProps {
    grupo: Grupo;
    onBack: () => void;
    onViewFeedback: () => void;
}

export function GroupDetail({ grupo, onBack, onViewFeedback }: GroupDetailProps) {
    return (
        <DetalleGrupo
            grupo={grupo}
            onBack={onBack}
            onViewFeedback={onViewFeedback}
        />
    );
}

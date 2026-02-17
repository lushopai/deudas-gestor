import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'clp',
    standalone: true
})
export class ClpPipe implements PipeTransform {
    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '$0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '$0';
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(num);
    }
}

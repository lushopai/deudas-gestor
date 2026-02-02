import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'defaultAvatar',
    standalone: true
})
export class DefaultAvatarPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        return value || 'assets/default-avatar.png';
    }
}

<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Gerenciamento';

    protected static ?string $navigationLabel = 'Usuários';

    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make()
                    ->schema([
                        Section::make('Informações Básicas')
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nome')
                                    ->required()
                                    ->maxLength(255),

                                TextInput::make('email')
                                    ->label('Email')
                                    ->email()
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255),

                                TextInput::make('password')
                                    ->label('Senha')
                                    ->password()
                                    ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                                    ->dehydrated(fn ($state) => filled($state))
                                    ->required(fn (string $context): bool => $context === 'create'),

                                FileUpload::make('profile_image')
                                    ->label('Imagem de Perfil')
                                    ->image()
                                    ->disk('public')
                                    ->directory('profile-images')
                                    ->visibility('public')
                                    ->imageResizeMode('cover')
                                    ->imageCropAspectRatio('1:1')
                                    ->imageResizeTargetWidth('300')
                                    ->imageResizeTargetHeight('300'),
                            ])
                            ->columns(2),

                        Section::make('Informações Académicas')
                            ->schema([
                                DatePicker::make('graduation_year')
                                    ->label('Data de Graduação')
                                    ->displayFormat('Y')
                                    ->maxDate(now()),

                                Select::make('course_id')
                                    ->label('Curso')
                                    ->options(function () {
                                        return \App\Models\Course::all()->pluck('name', 'id');
                                    })
                                    ->searchable(),
                            ])
                            ->columns(2),

                        Section::make('Informações Profissionais')
                            ->schema([
                                Textarea::make('bio')
                                    ->label('Biografia')
                                    ->maxLength(1000)
                                    ->columnSpanFull(),

                                TextInput::make('current_job')
                                    ->label('Cargo Atual')
                                    ->maxLength(255),

                                TextInput::make('current_company')
                                    ->label('Empresa Atual')
                                    ->maxLength(255),

                                TextInput::make('linkedin_url')
                                    ->label('URL LinkedIn')
                                    ->url()
                                    ->prefix('https://')
                                    ->maxLength(255),
                            ])
                            ->columns(2),

                        Section::make('Permissões')
                            ->schema([
                                Select::make('is_admin')
                                    ->label('Nível de Acesso')
                                    ->options([
                                        false => 'Usuário Regular',
                                        true => 'Administrador',
                                    ])
                                    ->default(false)
                                    ->required(),
                            ]),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('profile_image')
                    ->label('Foto')
                    ->circular(),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nome')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('course_id')
                    ->label('Curso')
                    ->formatStateUsing(fn ($state) => $state ? \App\Models\Course::find($state)?->name : '')
                    ->searchable(),

                Tables\Columns\TextColumn::make('graduation_year')
                    ->label('Graduação')
                    ->sortable(),

                Tables\Columns\TextColumn::make('current_company')
                    ->label('Empresa')
                    ->searchable(),

                Tables\Columns\IconColumn::make('is_admin')
                    ->label('Admin')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Atualizado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('is_admin')
                    ->label('Tipo de Usuário')
                    ->options([
                        true => 'Administradores',
                        false => 'Usuários Regulares',
                    ]),

                SelectFilter::make('course_id')
                    ->label('Curso')
                    ->options(function () {
                        return \App\Models\Course::all()->pluck('name', 'id');
                    }),

                Tables\Filters\Filter::make('graduation_year')
                    ->form([
                        DatePicker::make('graduation_from')
                            ->label('Graduado desde')
                            ->displayFormat('Y'),
                        DatePicker::make('graduation_until')
                            ->label('Graduado até')
                            ->displayFormat('Y'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['graduation_from'],
                                fn (Builder $query, $date): Builder => $query->where('graduation_year', '>=', $date),
                            )
                            ->when(
                                $data['graduation_until'],
                                fn (Builder $query, $date): Builder => $query->where('graduation_year', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            // Você pode adicionar relation managers aqui se necessário
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}

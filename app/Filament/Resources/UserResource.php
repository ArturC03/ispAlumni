<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostsRelationManagerResource\RelationManagers\PostsRelationManager;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->label('Nome')
                    ->required(),
                TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->unique(User::class, 'email'),  // Ensure email is unique
                TextInput::make('password')
                    ->label('Senha')
                    ->password()
                    ->required(),
                FileUpload::make('profile_image')
                    ->label('Imagem de Perfil')
                    ->image()  // Ensure only images can be uploaded
                    ->nullable(),
                TextInput::make('graduation_year')
                    ->label('Ano de Graduação')
                    ->type('number')
                    ->minValue(1965)
                    ->nullable(),
                Select::make('course_id')
                    ->label('Curso')
                    ->options(\App\Models\Course::all()->pluck('name', 'id'))
                    ->nullable(),
                Textarea::make('bio')
                    ->label('Bio')
                    ->nullable(),
                TextInput::make('current_job')
                    ->label('Cargo Atual')
                    ->nullable(),
                TextInput::make('current_company')
                    ->label('Empresa Atual')
                    ->nullable(),
                TextInput::make('linkedin_url')
                    ->label('URL LinkedIn')
                    ->nullable(),
                Select::make('is_admin')
                    ->label('Administrador?')
                    ->options([
                        true => 'Sim',
                        false => 'Não',
                    ])
                    ->default(false),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nome'),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email'),
                Tables\Columns\TextColumn::make('graduation_year')
                    ->label('Ano de Graduação'),
                Tables\Columns\TextColumn::make('current_job')
                    ->label('Cargo Atual'),
                Tables\Columns\TextColumn::make('current_company')
                    ->label('Empresa Atual'),
                Tables\Columns\TextColumn::make('linkedin_url')
                    ->label('LinkedIn'),
                Tables\Columns\BooleanColumn::make('is_admin')
                    ->label('Administrador'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('is_admin')
                    ->label('Administrador')
                    ->options([
                        true => 'Sim',
                        false => 'Não',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // Define relationships here if needed
            'posts' => PostsRelationManager::class,
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

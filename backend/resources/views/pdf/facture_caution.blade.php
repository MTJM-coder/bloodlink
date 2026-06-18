<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            font-size: 13px;
            color: #1E293B;
            padding: 40px;
        }

        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #DC2626;
        }

        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #DC2626;
        }

        .logo span {
            display: block;
            font-size: 12px;
            color: #64748B;
            font-weight: normal;
            margin-top: 4px;
        }

        .facture-info {
            text-align: right;
        }

        .facture-info h2 {
            font-size: 18px;
            font-weight: bold;
            color: #1E293B;
            margin-bottom: 6px;
        }

        .facture-info p {
            color: #64748B;
            font-size: 12px;
        }

        /* PARTIES */
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
        }

        .partie {
            flex: 1;
            background: #F8FAFC;
            border: 1px solid #EEF1F5;
            border-radius: 8px;
            padding: 14px;
        }

        .partie h3 {
            font-size: 11px;
            color: #94A3B8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }

        .partie p {
            font-size: 13px;
            color: #1E293B;
            margin-bottom: 4px;
        }

        .partie .nom {
            font-weight: bold;
            font-size: 14px;
        }

        /* TABLEAU */
        .table-section {
            margin-bottom: 30px;
        }

        .table-section h3 {
            font-size: 13px;
            font-weight: bold;
            color: #1E293B;
            margin-bottom: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead tr {
            background: #1E293B;
            color: white;
        }

        thead th {
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 500;
        }

        tbody tr {
            border-bottom: 1px solid #EEF1F5;
        }

        tbody tr:nth-child(even) {
            background: #F8FAFC;
        }

        tbody td {
            padding: 10px 12px;
            font-size: 13px;
            color: #1E293B;
        }

        /* MONTANT */
        .montant-section {
            margin-left: auto;
            width: 280px;
            margin-bottom: 30px;
        }

        .montant-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #EEF1F5;
            font-size: 13px;
        }

        .montant-row.total {
            background: #DC2626;
            color: white;
            padding: 12px;
            border-radius: 8px;
            border: none;
            font-weight: bold;
            font-size: 15px;
            margin-top: 8px;
        }

        .montant-row .label {
            color: #64748B;
        }

        .montant-row.total .label {
            color: white;
        }

        /* STATUT */
        .statut-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
        }

        .statut-en_attente {
            background: #FFFBEB;
            color: #92400E;
        }

        .statut-partiellement_remboursee {
            background: #EFF6FF;
            color: #1D4ED8;
        }

        .statut-remboursee {
            background: #F0FDF4;
            color: #166534;
        }

        /* PROGRESSION DONNEURS */
        .progression {
            margin-bottom: 30px;
            background: #F8FAFC;
            border: 1px solid #EEF1F5;
            border-radius: 8px;
            padding: 16px;
        }

        .progression h3 {
            font-size: 12px;
            color: #94A3B8;
            text-transform: uppercase;
            margin-bottom: 12px;
        }

        .prog-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
        }

        .prog-row .label {
            color: #64748B;
        }

        .prog-row .value {
            font-weight: 500;
            color: #1E293B;
        }

        /* FOOTER */
        .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #EEF1F5;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
        }

        .footer strong {
            color: #DC2626;
        }

        .btn-print{
            background: #1E293B;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
        }

        .btn-download {
            background: #DC2626;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <!-- @if(!request()->has('pdf'))
    <div style="text-align: right; margin-bottom: 20px; display: flex; gap: 10px; justify-content: flex-end;">
        <button
            onclick="window.print()"
            class="btn-print">
            Imprimer
        </button>
        <button
            onclick="window.location.href = window.location.href + '?download=1'"
            class="btn-download">
            Telecharger
        </button>
    </div>
    @endif -->
    <!-- HEADER -->
    <div class="header">
        <div class="logo">
            BloodLink
            <span>Plateforme nationale de gestion du sang</span>
        </div>
        <div class="facture-info">
            <h2>FACTURE DE CAUTION</h2>
            <p>N° {{ str_pad($caution->id, 6, '0', STR_PAD_LEFT) }}</p>
            <p>Date : {{ now()->format('d/m/Y') }}</p>
        </div>
    </div>

    <!-- PARTIES -->
    <div class="parties">
        <div class="partie">
            <h3>Banque de sang</h3>
            <p class="nom">{{ $banque->nom }}</p>
            <p>{{ $banque->adresse }}</p>
            <p>{{ $banque->quartier }}, {{ $banque->ville }}</p>
            <p>{{ $banque->telephone }}</p>
            <p>{{ $banque->email }}</p>
        </div>

        <div class="partie">
            <h3>Famille concernée</h3>
            <p class="nom">{{ $caution->representant_nom }}</p>
            <p>{{ $caution->representant_telephone }}</p>
            <p>Enregistrée le : {{ \Carbon\Carbon::parse($caution->date_enregistrement)->format('d/m/Y') }}</p>
        </div>
    </div>

    <!-- TABLEAU DETAILS -->
    <div class="table-section">
        <h3>Détails de la caution</h3>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Poche concernée</th>
                    <th>Donneurs dus</th>
                    <th>Donneurs ramenés</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Caution pour sortie de poche de sang</td>
                    <td>
                        @if($caution->poche)
                        {{ $caution->poche->groupe_sanguin }}{{ $caution->poche->rhesus }}
                        — {{ $caution->poche->type_produit }}
                        @else
                        —
                        @endif
                    </td>
                    <td>{{ $caution->nb_donneurs_attendus }}</td>
                    <td>{{ $caution->nb_donneurs_ramenes ?? 0 }}</td>
                    <td>
                        <span class="statut-badge statut-{{ $caution->statut }}">
                            @if($caution->statut === 'en_attente') En attente
                            @elseif($caution->statut === 'partiellement_remboursee') Partiellement remboursée
                            @else Remboursée
                            @endif
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- PROGRESSION DONNEURS -->
    <div class="progression">
        <h3>Suivi des donneurs</h3>
        <div class="prog-row">
            <span class="label">Nombre de donneurs attendus</span>
            <span class="value">{{ $caution->nb_donneurs_attendus }}</span>
        </div>
        <div class="prog-row">
            <span class="label">Nombre de donneurs ramenés</span>
            <span class="value">{{ $caution->nb_donneurs_ramenes ?? 0 }}</span>
        </div>
        <div class="prog-row">
            <span class="label">Reste à amener</span>
            <span class="value">
                {{ max(0, $caution->nb_donneurs_attendus - ($caution->nb_donneurs_ramenes ?? 0)) }}
            </span>
        </div>
        @if($caution->date_remboursement)
        <div class="prog-row">
            <span class="label">Date de remboursement</span>
            <span class="value">{{ \Carbon\Carbon::parse($caution->date_remboursement)->format('d/m/Y') }}</span>
        </div>
        @endif
    </div>

    <!-- MONTANT -->
    <div class="montant-section">
        <div class="montant-row">
            <span class="label">Montant de la caution</span>
            <span>{{ number_format($caution->montant, 0, ',', ' ') }} FCFA</span>
        </div>
        <div class="montant-row">
            <span class="label">Frais d'examen</span>
            <span>16 000 FCFA</span>
        </div>
        <div class="montant-row total">
            <span class="label">Total facturé</span>
            <span>{{ number_format($caution->montant + 16000, 0, ',', ' ') }} FCFA</span>
        </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <p>
            Document généré automatiquement par <strong>BloodLink</strong>
            le {{ now()->format('d/m/Y à H:i') }}
        </p>
        <p style="margin-top: 6px;">
            {{ $banque->nom }} — {{ $banque->adresse }}, {{ $banque->ville }}
            — {{ $banque->telephone }}
        </p>
    </div>

</body>

</html>
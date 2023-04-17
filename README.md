# Zendesk App for Swiss21.org 

## Project setup
```
npm i
npm build
npm run deploy
```

## Objectif
L’objectif du projet est de créer une application zendesk pour simplifier l’action de création d'un nouveau ticket à la suite des échanges avec le client.Le nouveau ticket sera créés avec l’état qui correspond au contexte de support souhaité. C'est à dire avec un nouveau titre qui correspond au problème du client. Si l’opération s'est déroulée avec succès, le ticket d’origine sera fermé.

## Tâches:
* L’application se présente sur la droite à l’ouverture d’un ticket depuis zendesk.
* Elle propose un formulaire simple pour la création d'un nouveau ticket.
* L'agent doit sélectionner l'application de support Swiss21 concernée (liste déroulante).
* L'agent doit aussi renseigner le sujet du nouveau ticket.
* Le nouveau ticket hérite des données du ticket principale.
  * type, subject, priority, group_id, custom_fields:app, ticket_form_id, et le brand_id.
* Si tout a bien fonctionné, le ticket parent est fermé et le client est informé du suivi.
* Une information visuelle sera présentée à l’Agent (succès ou erreur).







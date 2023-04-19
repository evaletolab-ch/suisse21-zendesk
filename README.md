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

## Création d'un nouveau ticket
Voici la liste des champs zendesk qui sont utilisés pour la création du nouveau ticket:

* ticket.type **(parent)**
* ticket.assignee_id **(parent)**
* ticket.requester.id **(parent)**
* ticket.requester.name **(parent)**
* ticket.requester.email **(parent)**
* ticket.group_id **(parent)**
* ticket.tags **(new)**
* ticket.ticket_form_id **(parent)**
* ticket.brand_id **(parent)**
* ticket.organisation_id **(parent)**
* ticket.priority **(parent)**
* ticket.fields **(new)**
* ticket.custom_fields **(new)**
* ticket.subject **(new)**
* ticket.description **(selected comment from parent)**

De plus le tag **ticket_forked** est ajouté de façon à pouvoir générer des raports.

## Installation
Après avoir installer l'application depuis le fichier `app-zendesk.zip` il faut configurer les deux options suivantes (avec les bonnes valeurs):

![image](https://user-images.githubusercontent.com/1422935/233100673-f2a8aaff-ea92-45a1-ae4d-acd36923bcb5.png)










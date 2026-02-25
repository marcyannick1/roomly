renommer “likes” en “swipes” parce qu’on va tracker les deux sens, ce qu’il aime et ce qu’il n’aime pas

renommer “listings” en “properties” pour plus de clarté

séparer et renommer les dossiers pour plus de clarté

renommer certains champs du français à l'anglais pour plus de consistance

modification du mauvais design de la table anciennement "listings" il avait les attributs en tant que champs ex: wifi, parking, etc. Dans le cas où on voudrait ajouter plus d'option, il faudrait encore ajouter des champs. C'est un mauvais design. 
table "AMENITIES" (commodités) pour résoudre le problème.

Pour les messages de type « Instagram », le mieux c'est d'utiliser un champ last_message et unread_count soient facilement accessibles. L'inclure à la table MATCHES permet d'économiser de l'espace dans la base de données.

Utiliser sqlModel qui est beaucoup plus performant que sql alchemy tout simple même s'il l'utilise en dessous.

Utiliser uv pour comme package manager pour le backend, c'est plus rapide que pip et plus moderne.
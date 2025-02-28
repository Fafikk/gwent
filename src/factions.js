"use strict"

var factions = {
	realms: {
		name: i18next.t("factions.realms.name"),
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount-2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		description: i18next.t("factions.realms.description")
	},
	nilfgaard: {
		name: i18next.t("factions.nilfgaard.name"),
		description: i18next.t("factions.nilfgaard.description"),
	},
	monsters: {
		name: i18next.t("factions.monsters.name"),
		factionAbility: player => game.roundEnd.push( () => {
			let units = board.row.filter( (r,i) => player === player_me ^ i < 3)
				.reduce((a,r) => r.cards.filter(c => c.isUnit()).concat(a), []);
			if (units.length === 0)
				return;
			let card = units[randomInt(units.length)];
			card.noRemove = true;
			game.roundStart.push( async () => {
				await ui.notification("monsters", 1200);
				delete card.noRemove;
				return true; 
			});
			return false;
		}),
		description: i18next.t("factions.monsters.description")
	},
	scoiatael: {
		name: i18next.t("factions.scoiatael.name"),
		factionAbility: player => game.gameStart.push( async () => {
			if (player === player_me) {
				await ui.popup("Go First", () => game.firstPlayer = player, "Let Opponent Start", () => game.firstPlayer = player.opponent(), "Would you like to go first?", "The Scoia'tael faction perk allows you to decide who will get to go first.");
				socket.send(JSON.stringify({ type: 'scoiataelStart', first: game.firstPlayer.tag }));
			}
			return true;
		}),
		description: i18next.t("factions.scoiatael.description")
	},
	skellige: {
		name: i18next.t("factions.skellige.name"),
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount != 3)
				return false;
			await ui.notification("skellige-" + player.tag, 1200);
			await Promise.all(player.grave.findCardsRandom(c => c.isUnit(), 2).map(c => board.toRow(c, player.grave)));
			return true;
		}),
		description: i18next.t("factions.skellige.description")
	}
}
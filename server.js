"use strict"
var emitter = require('events').EventEmitter
var twitchAPI = require('node-twitchtv')

class TwitchPopularStreams extends emitter {
	constructor(opts) {
		super()
		if (!opts) opts = {};
		if (!opts.client_id) console.error('Twitch Client ID or Client Secret not supplied!')
		this.interval = opts.interval ? opts.interval*1000 : 60000
		this.twitchAPI = new twitchAPI(opts)
		this.start()
	}

	start() {
		var self = this;
		setInterval(function() {
			self._getStreamers(self._getStreamersCallback)
		}, this.interval)

		this._getStreamers(this._getStreamersCallback)
	}

	_getStreamersCallback(streams, self) {
		self.emit("streams", streams)
	}

	_getStreamers(cb) {
		var self = this;
		this.twitchAPI.streamsFeatured(function(err, res) {
			cb((res.featured.map(s => s.stream.channel.name)), self)
		})
	}
}

module.export = TwitchPopularStreams
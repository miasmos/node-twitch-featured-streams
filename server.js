"use strict"
var emitter = require('events').EventEmitter
var twitchAPI = require('node-twitchtv-stephenpoole')

class TwitchPopularStreams extends emitter {
	constructor(opts) {
		super()
		if (!opts) opts = {};
		if (!opts.client_id) console.error('Twitch Client ID not supplied!')
		this.interval = opts.interval ? opts.interval*1000 : 60000
		this.twitchAPI = new twitchAPI(opts)
		this.streamers = [];
		this.count = 0;
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
		for (var i in streams) {
			if (self.streamers.indexOf(streams[i]) == -1) {
				//if the stream isn't already in our list, add it and emit an event
				self.streamers.push(streams[i])
				self.emit("addStream", streams[i])
			}
		}

		for (var i in self.streamers) {
			if (streams.indexOf(self.streamers[i]) == -1) {
				//if the stream is in the current featured list, we know it's live
				//for all other streams, check if it's offline, and if so, emit an event
				self._getStreamStatus(self.streamers[i], function(res) {
					if (!res) {
						self.emit("removeStream", self.streamers[i])
						self.streamers.splice(i,1)
					}
				})
			}
		}
		self.count++;
	}

	_getStreamers(cb) {
		var self = this;
		this.twitchAPI.streamsFeatured(function(err, res) {
			cb((res.featured.map(s => s.stream.channel.name)), self)
		})
	}

	_getStreamStatus(channel,cb) {
		var self = this;
		this.twitchAPI.streamsChannel({"channel":channel}, function(err, res) {
			if (!err && res) {
				if (res.stream && res.stream !== null) {
					cb(true)
					return
				}
			}
			cb(false)
		})
	}
}

module.exports = TwitchPopularStreams
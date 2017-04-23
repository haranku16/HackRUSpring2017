import threshold_learner
import pyaudio
import numpy
import httplib
import threading
import time
import json
from synchronized import synchronized

class Threshold:
	def __init__(self):
		self.threshold = 0.0
	@synchronized
	def learn(self):
		self.threshold = threshold_learner.learn()
	@synchronized
	def get(self):
		return self.threshold

class RunStatus:
	def __init__(self):
		self.status = False
	@synchronized
	def flip(self):
		self.status = not self.status
	@synchronized
	def get(self):
		return self.status

threshold = Threshold()

running = RunStatus()

ser = '0c812423eca0798887dc28479baa08a8818adb183a7792c4e07325a47469877f4bd4e76023e66413c3d6cd6417e05170'
privkey = 'd93d01e5dbb470f605481898b66cc97f6d3f793cffe5d12ccb83944fd0b509b0fded28ae99e58bf6654af03b36fc497b'

def makeJson():
	m = { 'serialNumber':ser,'privateKey':privkey }
	return json.dumps(m,True)

def sSend():
	conn = httplib.HTTPConnection('adapter.cs.rutgers.edu:3000')
	print 'Sending:',makeJson()
	conn.request('POST','/device-event',makeJson(),{'Content-Type':'application/json'})
	res = conn.getresponse()
	print(res.status)
	print('Sent message to server, got response status:',res)
	
def sListen():
	CHUNK = 440000
        FORMAT = pyaudio.paInt16
        CHANNELS = 2
        RATE = 44100
        RECORD_SECONDS = 5
        WAVE_OUTPUT_FILENAME = "output.wav"

        p = pyaudio.PyAudio()

        stream = p.open(format = FORMAT, channels = CHANNELS, rate = RATE, input = True, frames_per_buffer=CHUNK)
	
        print("* recording learning sample")

	while running.get():
		data = stream.read(CHUNK)
		frames = numpy.fromstring(data, numpy.int16).astype(numpy.int64)
		curramp = numpy.average(numpy.square(frames))
		print 'Current amp is ',curramp
		if(curramp > threshold.get()):
			sSend()
	stream.stop_stream()
	stream.close()
	p.terminate()
if __name__ == "__main__":
	thread1 = False
	while True:
		case = raw_input('Enter learn, start, stop or quit\n')
		if(case == 'learn'):
			threshold.learn()
			print threshold.get()
		if(case == 'start'):
			if not running.get():
				running.flip()
				thread1 = threading.Thread(group = None, target=sListen)	
				thread1.start()		
			else:
				print('Recorder already running.')
		if(case == 'stop'):
			if running.get():
				running.flip()
				thread1.join()
			else:
				print('Recorder is not running.')
			
		if(case == 'quit'):
			if running.get():
				running.flip()
			if thread1 != False: 
				thread1.join()
			break

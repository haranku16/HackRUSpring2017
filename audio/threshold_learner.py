import pyaudio
import numpy

def learn():
	CHUNK = 1024
	FORMAT = pyaudio.paInt16
	CHANNELS = 2
	RATE = 44100
	RECORD_SECONDS = 5
	WAVE_OUTPUT_FILENAME = "output.wav"

	p = pyaudio.PyAudio()

	stream = p.open(format = FORMAT, channels = CHANNELS, rate = RATE, input = True, frames_per_buffer=CHUNK)

	print("* recording learning sample")
 
	ampSum = 0.0
	numframes = 0

	data = stream.read(220500)
	frames = numpy.fromstring(data,numpy.int16).astype(numpy.int64)
	ampSum = numpy.average(numpy.square(frames))
	print ampSum
	"""for i in range(0, int(RATE/CHUNK * RECORD_SECONDS)):
		data = stream.read(CHUNK)
		frames = numpy.fromstring(data,numpy.int16).astype(numpy.int64)
		ampSum += numpy.sum(numpy.square(frames))
		numframes += len(frames)
	ampSum /= numframes"""
	print("* recording learning sample")
	stream.stop_stream()
	stream.close()
	p.terminate()
	return ampSum

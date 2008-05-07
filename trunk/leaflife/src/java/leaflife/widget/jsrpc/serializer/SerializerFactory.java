package leaflife.widget.jsrpc.serializer;

import java.util.Hashtable;

/**
 * Factory for creating JSON serializer objects.
 * @author huangchao
 */
public class SerializerFactory
{
    private static SerializerFactory factory_instance;  // instance of serializer factory
    private static Hashtable serializers = new Hashtable();  // serializers registered
    private int max_marshall_level = 3;
    private ObjectSerializer obj_serializer = new ObjectSerializer();  // use to converting to and from Object and JSON string
    private ArraySerializer array_serializer = new ArraySerializer();  // use to converting to and from Array and JSON string

    private SerializerFactory()
    {
        // Register default serializers
        Serializer[] default_serializers = new Serializer[] {new BooleanSerializer(), new ByteSerializer(), new CalendarSerializer(), new CharacterSerializer(), new DateSerializer(), new DoubleSerializer(), new FloatSerializer(), new IntegerSerializer(), new ListSerializer(), new LongSerializer(), new MapSerializer(), new SetSerializer(), new ShortSerializer(), new StringSerializer()};
        for (int i = 0; i < default_serializers.length; ++ i)
        {
            Serializer serializer = default_serializers[i];
            Class[] classes = serializer.getSerializableClasses();
            for (int j = 0; j < classes.length; ++ j)
            {
                serializers.put(classes[j], serializer);
            }
        }
    }

    public int getMaxMarshallLevel()
    {
        return max_marshall_level;
    }

    public void setMaxMarshallLevel(int max_marshall_level)
    {
        this.max_marshall_level = max_marshall_level;
    }

    /**
     * Constructs a serializer factory.
     * @return a serializer factory
     */
    public synchronized static SerializerFactory getInstance()
    {
        if (factory_instance == null)
        {
            factory_instance = new SerializerFactory();
        }
        return factory_instance;
    }

    /**
     * Registers a custom serializer for specified Class.
     * @param serializer the custom serializer
     * @param cls the Class object
     */
    public void registerSerializer(Serializer serializer, Class cls)
    {
        serializers.put(cls, serializer);
    }

    /**
     * Gets a serializer from registered serializers to convert to and from Java object and JSON string. If there is no appropriate serializer, then return default ObjectSerializer.
     * @param cls the type of Java object
     * @return the appropriate serializer
     */
    public Serializer getSerializer(Class cls)
    {
        if (cls.isArray())
        {
            return array_serializer;
        }
        else
        {
            Serializer result = (Serializer) serializers.get(cls);
            return result == null ? obj_serializer : result;  // // using default object serializer if there is no appropriate serializer
        }
    }

    public ArraySerializer getArraySerializer()
    {
        return array_serializer;
    }

    public ObjectSerializer getDefaultSerializer()
    {
        return obj_serializer;
    }
}

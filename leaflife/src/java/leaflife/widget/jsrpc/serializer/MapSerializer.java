package leaflife.widget.jsrpc.serializer;

import java.util.HashMap;
import java.util.Hashtable;
import java.util.IdentityHashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.WeakHashMap;
import java.util.Map.Entry;
import java.util.logging.Logger;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Map and JSON string.
 * @author huangchao
 */
public class MapSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {Map.class, HashMap.class, Hashtable.class, IdentityHashMap.class, LinkedHashMap.class, Properties.class, TreeMap.class, WeakHashMap.class};
    private transient static Logger logger = Logger.getLogger(MapSerializer.class.getName());

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        ++ level;
        StringBuffer result = new StringBuffer("{");
        Map map = (Map) obj;
        Set entries = map.entrySet();
        Iterator i = entries.iterator();
        while (i.hasNext())
        {
            Entry entry = (Entry) i.next();
            Object key = entry.getKey();
            if (key instanceof String)
            {
                Object value = entry.getValue();
                Serializer serializer = serializer_factory.getSerializer(value.getClass());
                if (serializer.canMarshall(level))
                {
                    result.append((String) key).append(":").append(serializer.marshall(value, level)).append(",");
                }
            }
            else
            {
                logger.warning("Marshalling map key of type \"" + key.getClass().getName() + "\" is not supported.");
                break;
            }
        }
        if (result.length() > 1)
        {
            result.deleteCharAt(result.length() - 1);  // delete last ","
        }
        result.append("}");
        return result.toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        logger.warning("Unmarshalling \"" + desired_class.getName() + "\" is not supported.");
        return null;
    }
}

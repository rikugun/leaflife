package leaflife.widget.jsrpc.serializer;

import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.logging.Logger;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Set and JSON string.
 * @author huangchao
 */
public class SetSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {Set.class, SortedSet.class, HashSet.class, LinkedHashSet.class, TreeSet.class};
    private transient static Logger logger = Logger.getLogger(SetSerializer.class.getName());

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        ++ level;
        StringBuffer result = new StringBuffer("[");
        Set set = (Set) obj;
        Iterator i = set.iterator();
        while (i.hasNext())
        {
            Object element = i.next();
            if (element != null)
            {
                Serializer serializer = serializer_factory.getSerializer(element.getClass());
                if (serializer.canMarshall(level))
                {
                    result.append(serializer.marshall(element, level)).append(",");
                }
            }
        }
        if (result.length() > 1)
        {
            result.deleteCharAt(result.length() - 1);  // delete last ","
        }
        result.append("]");
        return result.toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        logger.warning("Unmarshalling \"" + desired_class.getName() + "\" is not supported.");
        return null;
    }
}

package leaflife.widget.jsrpc.serializer;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Stack;
import java.util.Vector;
import java.util.logging.Logger;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to List and JSON string.
 * @author huangchao
 */
public class ListSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {List.class, ArrayList.class, LinkedList.class, Stack.class, Vector.class};
    private transient static Logger logger = Logger.getLogger(ListSerializer.class.getName());

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        ++ level;
        StringBuffer result = new StringBuffer("[");
        List list = (List) obj;
        Iterator i = list.iterator();
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

    /**
     * Converts the JSON string to a List object.
     * @param json the JSON string to be converted
     * @param desired_class the type of List object after convert
     * @param component_classes the type of List components after convert
     * @return an List instance of the JSON string
     * @throws InvalidJSONSyntaxException if the syntax JSON string is invalid
     * @throws UnmarshallException if the JSON string cannot be converted to a List object
     * @throws InvocationException if instantiating the specified class failed
     */
    public List unmarshall(Tokener json, Class desired_class, Class[] component_classes) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            List result = (List) desired_class.newInstance();
            ArraySerializer array_serializer = serializer_factory.getArraySerializer();
            Object[] objs = array_serializer.unmarshall(json, component_classes);
            for (int i = 0; i < objs.length; ++ i)
            {
                result.add(objs[i]);
            }
            return result;
        }
        catch (InstantiationException e)
        {
            throw new UnmarshallException("210");  // can not convert JSON string to list object
        }
        catch (IllegalAccessException e)
        {
            throw new UnmarshallException("210");  // can not convert JSON string to list object
        }
    }
}
